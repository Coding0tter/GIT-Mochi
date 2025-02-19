import { GitlabApiClient } from "@server/clients/gitlabApiClient";
import { ruleEvent } from "@server/decorators/ruleEventDecorator";
import { GitlabError } from "@server/errors/gitlabError";
import { MochiError } from "@server/errors/mochiError";
import { EventNamespaces, EventTypes } from "@server/events/eventTypes";
import { SettingRepo } from "@server/repositories/settingRepo";
import TaskEventEmitter from "@server/services/emitters/taskEventEmitter";
import TaskService from "@server/services/taskService";
import { UserService } from "@server/services/userService";
import SocketHandler from "@server/sockets";
import { ContextKeys, getContext } from "@server/utils/asyncContext";
import type { IPagination } from "shared/types/pagination";
import type { IDiscussion, ITask } from "shared/types/task";
import { GitlabSyncService } from "./gitlabSyncService";

export class GitlabService {
  // ─── DEPENDENCIES ──────────────────────────────────────────────
  private gitlabApiClient: GitlabApiClient;
  private taskService: TaskService;
  private taskEmitter: TaskEventEmitter;
  private userService: UserService;
  private settingRepo: SettingRepo;
  private gitlabSyncService: GitlabSyncService;

  constructor() {
    this.gitlabApiClient = new GitlabApiClient();
    this.taskService = new TaskService();
    this.taskEmitter = new TaskEventEmitter();
    this.userService = new UserService();
    this.settingRepo = new SettingRepo();
    this.gitlabSyncService = new GitlabSyncService(
      this.gitlabApiClient,
      this.taskService,
      this.taskEmitter,
    );
  }

  // ─── SYNCING FUNCTIONS ─────────────────────────────────────────
  /**
   * Sync merge requests and issues from GitLab for the current user and project.
   */
  async syncGitLabDataAsync(): Promise<void> {
    const user = await this.userService.getUser();
    const project = await this.settingRepo.getByKeyAsync("currentProject");

    if (!user) throw new GitlabError("No user found", 404);
    if (!project) throw new GitlabError("No project selected", 404);
    if (project.value.includes("custom_project")) return;

    const changes = this.gitlabSyncService.syncGitlabDataAsync(user, project);
    SocketHandler.getInstance().getIO().emit("updateTasks", changes);
  }

  // ─── MERGE REQUEST OPERATIONS ──────────────────────────────────

  /**
   * Create a merge request in GitLab based on an existing issue.
   */
  async createGitlabMergeRequestAsync(issueId: string) {
    const currentProject = getContext(ContextKeys.Project);
    if (!currentProject) throw new GitlabError("No project selected", 404);

    const issue = await this.taskService.findOneAsync({
      gitlabIid: parseInt(issueId),
    });
    if (!issue) throw new GitlabError("Issue not found", 404);

    await this.createBranch(currentProject.id, issue);

    const user = await this.getUserByAccessTokenAsync();
    if (!user) throw new GitlabError("No current user found", 404);

    const mergeRequestData = await this.createMergeRequest(
      currentProject.id,
      issue,
      user.gitlabId.toString(),
    );

    const newMergeRequestTaskResult = await this.taskEmitter.createTaskAsync(
      mergeRequestData.project_id,
      {
        labels: mergeRequestData.labels,
        branch: mergeRequestData.source_branch,
        gitlabId: mergeRequestData.id,
        web_url: mergeRequestData.web_url,
        type: "merge_request",
        gitlabIid: mergeRequestData.iid,
        title: mergeRequestData.title,
        description: mergeRequestData.description,
        status: "inprogress",
        custom: false,
      },
    );

    if (newMergeRequestTaskResult.error) {
      throw newMergeRequestTaskResult.error;
    }

    const newMergeRequestTask = newMergeRequestTaskResult.data;
    SocketHandler.getInstance()
      .getIO()
      .emit("updateTasks", [newMergeRequestTask]);

    return { mergeRequest: mergeRequestData };
  }

  @ruleEvent(EventNamespaces.GitLab, EventTypes.CreateBranch)
  private async createBranch(projectId: string, issue: ITask) {
    try {
      await this.gitlabApiClient.request(
        `/projects/${projectId}/repository/branches`,
        "POST",
        {
          id: projectId,
          branch: issue.gitlabIid,
          ref: "develop",
        },
      );
    } catch (e) {
      if (e instanceof MochiError) {
        await this.gitlabApiClient.request(
          `/projects/${projectId}/repository/branches`,
          "POST",
          {
            id: projectId,
            branch: "issue-" + issue.gitlabIid,
            ref: "develop",
          },
        );
      } else {
        throw e;
      }
    }
  }

  private async createMergeRequest(
    projectId: string,
    issue: ITask,
    userId: string,
  ) {
    return this.gitlabApiClient.request(
      `/projects/${projectId}/merge_requests`,
      "POST",
      {
        id: projectId,
        source_branch: issue.gitlabIid,
        target_branch: "develop",
        title: `Draft: Resolve "${issue.title}"`,
        description: `Closes #${issue.gitlabIid}`,
        assignee_id: userId,
        labels: issue.labels?.join(","),
        milestone_id: issue.milestoneId,
      },
    );
  }

  /**
   * Close merged merge requests (and delete closed issues) in the task service.
   */
  async closeMergedMergeRequestsAsync(): Promise<Partial<ITask>[]> {
    const changes: Partial<ITask>[] = [];

    const openMergeRequests = await this.taskService.getAllAsync({
      type: "merge_request",
      $or: [{ status: "inprogress" }, { status: "review" }],
    });

    const closedTasks = await this.taskService.getAllAsync({
      $or: [{ type: "merge_request" }, { type: "issue" }],
      status: "closed",
    });

    // Mark tasks that are closed in GitLab as deleted.
    for (const task of closedTasks) {
      if (task.type === "merge_request") {
        const mergeRequest = await this.gitlabApiClient.request(
          `/projects/${task.projectId}/merge_requests/${task.gitlabIid}`,
        );
        if (mergeRequest.state === "closed") {
          await this.taskService.setDeletedAsync(task._id as string);
        }
      } else {
        await this.taskService.setDeletedAsync(task._id as string);
      }
    }

    // For open merge requests, if they are now merged, update their status.
    for (const mr of openMergeRequests) {
      const mergeRequest = await this.gitlabApiClient.request(
        `/projects/${mr.projectId}/merge_requests/${mr.gitlabIid}`,
      );
      if (mergeRequest.state === "merged") {
        await this.taskEmitter.updateTaskAsync(mr._id as string, {
          status: "closed",
        });
        changes.push({ ...mr, status: "closed" });
      }
    }

    return changes;
  }

  // ─── DISCUSSIONS & COMMENTS ─────────────────────────────────────
  async resolveThreadAsync(task: ITask, discussion: IDiscussion) {
    const payload = { resolved: true };
    const response = await this.gitlabApiClient.request(
      `/projects/${task.projectId}/merge_requests/${task.gitlabIid}/discussions/${discussion.discussionId}`,
      "PUT",
      payload,
    );

    const updatedTask = await this.taskService.findOneAsync({ _id: task._id });
    if (updatedTask.discussions) {
      updatedTask.discussions = updatedTask.discussions.map((d) => {
        if (d.discussionId === discussion.discussionId) {
          d.notes = d.notes?.map((n) => {
            if (n.noteId === discussion.notes?.[0]?.noteId) {
              n.resolved = true;
            }
            return n;
          });
        }
        return d;
      });
    }
    SocketHandler.getInstance().getIO().emit("updateTasks", [updatedTask]);
    return response;
  }

  async commentOnTaskAsync(
    task: ITask,
    discussion: IDiscussion,
    reply: string,
  ) {
    const payload = {
      body: reply,
      type: "DiscussionNote",
      note_id: discussion.notes?.[0]?.noteId,
    };

    const response = await this.gitlabApiClient.request(
      `/projects/${task.projectId}/${
        task.type === "issue" ? "issues" : "merge_requests"
      }/${task.gitlabIid}/discussions/${discussion.discussionId}/notes`,
      "POST",
      payload,
    );

    const updatedTask = await this.taskService.findOneAsync({ _id: task._id });
    if (updatedTask.discussions) {
      updatedTask.discussions = updatedTask.discussions.map((d) => {
        if (d.discussionId === discussion.discussionId) {
          const note = this.transformNote(response);
          d.notes?.push(note);
        }
        return d;
      });
    }
    SocketHandler.getInstance().getIO().emit("updateTasks", [updatedTask]);
    return response;
  }

  // ─── PIPELINE & TEST REPORTS ─────────────────────────────────────
  async getLatestPipelineAsync(projectId: string, mergeRequestIid: string) {
    const pipelines = await this.gitlabApiClient.request(
      `/projects/${projectId}/merge_requests/${mergeRequestIid}/pipelines`,
    );
    return pipelines.length ? pipelines[0] : null;
  }

  async getFaultyTestCasesAsync(projectId: string, pipelineId: number) {
    const report = await this.gitlabApiClient.request(
      `/projects/${projectId}/pipelines/${pipelineId}/test_report?per_page=100`,
    );
    return report.test_suites.flatMap((suite: any) =>
      suite.test_cases.filter((test: any) => test.status === "failed"),
    );
  }

  // ─── USER & PROJECT OPERATIONS ──────────────────────────────────
  async getUserByAccessTokenAsync() {
    const response = await this.gitlabApiClient.request("/user");
    let user = await this.userService.getUser();

    if (!user) {
      user = await this.userService.createUser({
        gitlabId: response.id,
        username: response.username,
        email: response.email,
        name: response.name,
        avatar_url: response.avatar_url,
      });
    }
    return user;
  }

  async getProjectsAsync() {
    return this.gitlabApiClient.request("/projects?per_page=100");
  }

  async getTodosAsync() {
    let pagination: Partial<IPagination> = {
      currentPage: 1,
      limit: 100,
      totalPages: 1,
    };
    let totalTodos: any[] = [];

    do {
      const { data, pagination: nextPagination } =
        await this.gitlabApiClient.paginatedRequest(
          `/todos?page=${pagination.currentPage}&per_page=${pagination.limit}`,
        );
      totalTodos = totalTodos.concat(data);
      pagination.currentPage = nextPagination.nextPage;
    } while (pagination.currentPage < (pagination.totalPages ?? 1));

    return totalTodos;
  }

  async getUsersAsync() {
    return this.gitlabApiClient.request("/users?per_page=100");
  }

  async assignToUserAsync(taskId: string, userId: string) {
    const task = await this.taskService.findOneAsync({ _id: taskId });
    if (!task) throw new MochiError("Task not found", 404);
    await this.gitlabApiClient.request(
      `/projects/${task.projectId}/merge_requests/${task.gitlabIid}`,
      "PUT",
      { assignee_id: userId },
    );
  }

  // ─── DISCUSSIONS HELPERS ─────────────────────────────────────────
  async getDiscussionsAsync(
    projectId: string,
    gitlabIid: string,
    type: string,
  ) {
    let pagination: Partial<IPagination> = {
      currentPage: 1,
      limit: 100,
      totalPages: 1,
    };
    let totalDiscussions: any[] = [];

    do {
      const { data, pagination: nextPagination } =
        await this.gitlabApiClient.paginatedRequest(
          `/projects/${projectId}/${type}/${gitlabIid}/discussions?page=${pagination.currentPage}&per_page=${pagination.limit}`,
        );
      totalDiscussions = totalDiscussions.concat(data);
      pagination.currentPage = nextPagination.nextPage;
    } while (pagination.currentPage < (pagination.totalPages ?? 1));

    return totalDiscussions.map(this.transformDiscussion);
  }

  async getDiscussionsPaginatedAsync(
    taskId: string,
    pagination: Pick<IPagination, "currentPage" | "limit">,
  ) {
    const task = await this.taskService.findOneAsync({ _id: taskId });
    const { data: discussions, pagination: resultPagination } =
      await this.gitlabApiClient.paginatedRequest(
        `/projects/${task.projectId}/${
          task.type === "issue" ? "issues" : "merge_requests"
        }/${task.gitlabIid}/discussions?per_page=${pagination.limit}&page=${
          pagination.currentPage
        }&order_by=created_at&sort=asc`,
      );

    const transformedDiscussions = discussions.map(this.transformDiscussion);
    return { data: transformedDiscussions, pagination: resultPagination };
  }

  /**
   * Normalize a discussion object.
   */
  private transformDiscussion = (discussion: any): IDiscussion => {
    discussion.discussionId = discussion.id.toString();
    delete discussion.id;
    if (Array.isArray(discussion.notes)) {
      discussion.notes = discussion.notes.map((note: any) =>
        this.transformNote(note),
      );
    }
    return discussion;
  };

  /**
   * Normalize a discussion note.
   */
  private transformNote = (note: any): any => {
    note.noteId = note.id.toString();
    delete note.id;
    note.author.authorId = note.author.id.toString();
    note.resolved = note.resolved || false;
    if (note.resolved && note.resolved_by) {
      note.resolved_by.authorId = note.resolved_by.id.toString();
    }
    return note;
  };
}
