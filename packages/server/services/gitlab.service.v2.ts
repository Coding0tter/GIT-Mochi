import { GitlabClient } from "@server/clients/gitlab.v2.client.ts";
import { MochiError } from "@server/errors/mochi.error.ts";
import { SettingService } from "@server/services/setting.service.v2.ts";
import SocketHandler from "@server/sockets/index.ts";
import type { GitlabSyncV2 } from "@server/syncs/gitlab.sync.v2.ts";
import { fetchAllFromPaginatedApiAsync } from "@server/utils/fetchAllFromPaginatedApi.ts";
import { logInfo } from "@server/utils/logger.ts";
import { orderBy, uniqBy } from "lodash";
import { SettingKeys } from "shared";
import type { GitlabDiscussion } from "shared/types/gitlab/discussion.ts";
import type { GitlabIssue } from "shared/types/gitlab/issue.ts";
import { type GitlabMergeRequest } from "shared/types/gitlab/merge_request.ts";
import type { GitlabUser } from "shared/types/gitlab/user.ts";
import type { ITaskV2 } from "shared/types/index.ts";
import type { RequestParams } from "shared/types/request.ts";

interface SyncOptions {
  fullSync?: boolean;
  userId?: number;
  syncSince?: Date;
}

export class GitlabServiceV2 {
  private _gitlabClient: GitlabClient;
  private _settingService: SettingService;

  constructor() {
    this._gitlabClient = new GitlabClient();
    this._settingService = new SettingService();
  }

  async fetchRelatedMergeRequests(issueIid: number) {
    const { data: related_merge_requests } = await this._requestOnProject<
      GitlabMergeRequest[]
    >(`/issues/${issueIid}/related_merge_requests`);

    const { data: closing_merge_requests } = await this._requestOnProject<
      GitlabMergeRequest[]
    >(`/issues/${issueIid}/closed_by`);

    return uniqBy(
      [...related_merge_requests, ...closing_merge_requests],
      "iid",
    );
  }

  async fetchIssues(options?: SyncOptions): Promise<GitlabIssue[]> {
    return await this._fetchEntities("issues", options);
  }

  async fetchIssueByIid(issueIid: number): Promise<GitlabIssue> {
    const { data } = await this._requestOnProject<GitlabIssue>(
      `/issues/${issueIid}`,
    );

    return data;
  }

  async fetchMergeRequests(
    options?: SyncOptions,
  ): Promise<GitlabMergeRequest[]> {
    return await this._fetchEntities("merge_requests", options);
  }

  async getReviewerStates(mergeRequestIid: number) {
    const { data: approvals } = await this._requestOnProject<
      {
        user: GitlabUser;
        state: string;
      }[]
    >(`/merge_requests/${mergeRequestIid}/reviewers`);

    return approvals;
  }

  async fetchDiscussions(issueIid: number, mergeRequestIids?: number[]) {
    const project = await this._settingService.getSettingByKey<string>(
      SettingKeys.CURRENT_PROJECT,
    );
    if (!project) {
      throw new MochiError("No project selected", 400);
    }

    let discussions = await this._gitlabClient.get<GitlabDiscussion[]>(
      `/projects/${project}/issues/${issueIid}/discussions?per_page=100`,
    );

    discussions = discussions || [];
    discussions = discussions.map((item) => ({
      ...item,
      iid: Number(issueIid),
    }));

    if (mergeRequestIids?.length) {
      mergeRequestIids = Array.from(new Set(mergeRequestIids));
      for (const mrIid of mergeRequestIids) {
        let mrDiscussions = await this._gitlabClient.get<GitlabDiscussion[]>(
          `/projects/${project}/merge_requests/${mrIid}/discussions?per_page=100`,
        );

        mrDiscussions = mrDiscussions || [];
        mrDiscussions = mrDiscussions.map((item) => ({
          ...item,
          iid: Number(mrIid),
        }));

        discussions = discussions.concat(mrDiscussions);
      }
    }

    return discussions;
  }

  async getPipelineDetails(mrIid: number) {
    const { data: pipelines } = await this._requestOnProject<
      {
        id: number;
        iid: number;
        created_at: Date;
      }[]
    >(`/merge_requests/${mrIid}/pipelines`);

    if (pipelines.length === 0) {
      throw new MochiError("No pipelines found for this merge request", 404);
    }

    const latestPipeline = orderBy(pipelines, "created_at", "desc").at(0);

    const { data: pipelineDetails } = await this._requestOnProject<any>(
      `/pipelines/${latestPipeline?.id}`,
    );
  }

  async setReviewers(mrIid: number, userIds: number[]) {
    await this._requestOnProject(`/merge_requests/${mrIid}`, {
      method: "PUT",
      data: {
        reviewer_ids: userIds,
      },
    });
  }

  async syncLabels(iid: number, labels: string[], type: string) {
    await this._requestOnProject(`/${type}/${iid}`, {
      method: "PUT",
      params: {
        labels: labels.join(","),
      },
    });
  }

  async createMergeRequest(task: ITaskV2, userId: number, branchName?: string) {
    if (!task) throw new MochiError("Task not found", 404);

    branchName = branchName || task.iid.toString();

    const description = `## Checks before submitting this MR to review
- [ ] Review completed according to: https://git.latido.at/latido/latido/-/blob/develop/CODEREVIEW.md 
- [ ] Merge request is not draft
- [ ] Merge request has appropriate title, summarizing all changes
- [ ] Merge request contains a release note if customer facing changes has been made
- [ ] Closes #issuenr in commit message
- [ ] Commits properly structured that work on their own with meaningful messages
- [ ] Pipeline is Green
- [ ] \`!important\` tag in commit message to advise caution during update (eg. dependency on microservice update: \`!important update scheduling first\`)

Closes #${task.iid}`;

    await this._createBranch(branchName!);
    const newMr = await this._createMR(branchName!, task, userId, description);

    task.merge_requests = [...(task.merge_requests ?? []), newMr];

    await task.save();

    SocketHandler.getInstance().getIO().emit("tasks.changed", [task]);
  }

  private async _createMR(
    branchName: string,
    task: ITaskV2,
    userId: number,
    description: string,
  ) {
    const currentProject = await this._settingService.getSettingByKey<string>(
      SettingKeys.CURRENT_PROJECT,
    );

    try {
      const newMR = await this._requestOnProject(`/merge_requests`, {
        method: "POST",
        data: {
          id: currentProject,
          source_branch: branchName,
          target_branch: "develop",
          title: `Draft: Resolve ${task.title}`,
          assignee_id: userId,
          labels: task.labels.join(","),
          description: description,
          // milestone_id: task.milestone_id,
        },
      });

      return newMR;
    } catch (err) {
      throw new MochiError("Failed to create merge request", 500, err as Error);
    }
  }

  private async _createBranch(branchName: string) {
    try {
      await this._requestOnProject(`/repository/branches`, {
        method: "POST",
        data: {
          branch: branchName,
          ref: "develop",
        },
      });
    } catch (err) {
      throw new MochiError("Failed to create branch", 500, err as Error);
    }
  }

  private async _fetchEntities(
    type: "issues" | "merge_requests",
    options?: SyncOptions,
  ) {
    const lastSync = await this._settingService.getSettingByKey<string>(
      SettingKeys.LAST_SYNC,
    );

    const project = await this._settingService.getSettingByKey<string>(
      SettingKeys.CURRENT_PROJECT,
    );

    if (!project) {
      throw new MochiError("No project selected", 400);
    }

    try {
      const params = {
        fullSync: options?.fullSync || false,
        type,
        project,
        lastSync: lastSync ? lastSync : undefined,
        userId: options?.userId,
      };

      const assignedEntities = await this.fetchEntitiesByUserRole({
        ...params,
        userRole: "assignee_id",
      });

      const authoredEntities = await this.fetchEntitiesByUserRole({
        ...params,
        userRole: "author_id",
      });

      let reviewerEntities: any[] = [];
      if (type === "merge_requests") {
        reviewerEntities = await this.fetchEntitiesByUserRole({
          ...params,
          userRole: "reviewer_id",
        });
      }

      return uniqBy(
        [...assignedEntities, ...authoredEntities, ...reviewerEntities],
        "iid",
      );
    } catch (err) {
      throw new MochiError(
        "Failed to fetch issues from GitLab",
        500,
        err as Error,
      );
    }
  }

  private async fetchEntitiesByUserRole(params: {
    fullSync: boolean;
    type: string;
    userRole: string;
    project: string;
    lastSync?: string;
    userId?: number;
  }) {
    const entities = await fetchAllFromPaginatedApiAsync((pagination) => {
      let endpoint = `/projects/${params.project}/${params.type}?page=${pagination.currentPage}&per_page=${pagination.limit}`;

      if (params.lastSync && !params.fullSync) {
        endpoint += `&updated_after=${params.lastSync}`;
      }

      if (params?.userId) {
        endpoint += `&${params.userRole}=${params.userId}`;
      }

      return this._paginatedRequest({
        endpoint: endpoint,
        method: "GET",
      });
    });

    return entities;
  }

  private async _paginatedRequest({
    endpoint,
    method = "GET",
    data,
  }: RequestParams) {
    const response = await this._gitlabClient.request({
      url: endpoint,
      method,
      data,
    });

    const pagination = {
      totalPages: Number(response.headers["x-total-pages"]),
      prevPage: Number(response.headers["x-prev-page"]),
      nextPage: Number(response.headers["x-next-page"]),
      currentPage: Number(response.headers["x-page"]),
    };

    return { data: response.data, pagination };
  }

  private async _requestOnProject<T>(
    endpoint: string,
    options?: {
      method?: string;
      body?: any;
      data?: any;
      params?: Record<string, any>;
    },
  ) {
    const project = await this._settingService.getSettingByKey<string>(
      SettingKeys.CURRENT_PROJECT,
    );
    if (!project) {
      throw new MochiError("No project selected", 400);
    }

    return await this._gitlabClient.request<T>({
      url: `/projects/${project}${endpoint}`,
      ...options,
    });
  }
}
