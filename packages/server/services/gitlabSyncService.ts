import type { GitlabApiClient } from "@server/clients/gitlabApiClient";
import type TaskService from "./taskService";
import type TaskEventEmitter from "./emitters/taskEventEmitter";
import type { ITask } from "shared/types/task";
import { chunkArray } from "@server/utils/chunkArray";
import { MochiError } from "@server/errors/mochiError";
import { fetchAllFromPaginatedApiAsync } from "@server/utils/fetchAllFromPaginatedApi";
import { createTaskData, deepEqual } from "@server/utils/taskUtils";
import { transformDiscussion } from "@server/utils/transformHelpers";

export class GitlabSyncService {
  constructor(
    private gitlabApiClient: GitlabApiClient,
    private taskService: TaskService,
    private taskEmitter: TaskEventEmitter,
  ) {}

  async syncGitlabDataAsync(user: any, project: any): Promise<ITask[]> {
    const [mergeRequestUpdates, issueUpdates] = await Promise.all([
      this.syncEntities(
        "merge_requests",
        "merge_request",
        project.value,
        user.gitlabId.toString(),
      ),
      this.syncEntities(
        "issues",
        "issue",
        project.value,
        user.gitlabId.toString(),
      ),
    ]);

    return [...mergeRequestUpdates, ...issueUpdates];
  }

  async syncEntities(
    endpoint: string,
    entityType: "merge_request" | "issue",
    projectId: string,
    userId: string,
  ): Promise<ITask[]> {
    const localTasks = await this.taskService.getAllAsync({
      custom: false,
      deleted: false,
      gitlabId: { $ne: null },
    });

    const [remoteEntitiesForUser, remoteEntitiesForLocal] = await Promise.all([
      this.fetchMyEntitiesFromGitlabAsync(endpoint, projectId, userId),
      this.fetchRemoteEntitiesForLocalTasks(localTasks, endpoint, projectId),
    ]);

    const allRemoteEntities = [
      ...remoteEntitiesForUser,
      ...remoteEntitiesForLocal,
    ];

    const uniqueEntities = new Map<number, any>();
    allRemoteEntities.forEach((entity) =>
      uniqueEntities.set(entity.id, entity),
    );

    const updatedTasksPromises = Array.from(uniqueEntities.values()).map(
      (entity) => this.processEntity(entity, entityType, projectId),
    );

    const updatedTasks = await Promise.all(updatedTasksPromises);
    return updatedTasks.filter((t) => t && !t.deleted) as ITask[];
  }

  async fetchRemoteEntitiesForLocalTasks(
    tasks: ITask[],
    endpoint: string,
    projectId: string,
  ): Promise<any[]> {
    const remoteEntities: any[] = [];
    const CHUNK_SIZE = 90;
    const iidChunks = chunkArray(
      tasks.map((t) => t.gitlabIid),
      CHUNK_SIZE,
    );

    await Promise.all(
      iidChunks.map(async (chunk) => {
        try {
          const query = chunk.map((iid) => `iids[]=${iid}`).join("&");
          const fetched = await this.gitlabApiClient.request(
            `/projects/${projectId}/${endpoint}?${query}&per_page=${CHUNK_SIZE}`,
          );
          remoteEntities.push(...fetched);
        } catch (err) {
          await Promise.all(
            chunk.map(async (iid) => {
              try {
                const fetched = await this.gitlabApiClient.request(
                  `/projects/${projectId}/${endpoint}?iids[]=${iid}`,
                );
                remoteEntities.push(...fetched);
              } catch (e: any) {
                if (e instanceof MochiError && e.statusCode === 404) {
                  const deadTask = tasks.find((t) => t.gitlabIid === iid);
                  if (deadTask) {
                    await this.taskService.setDeletedAsync(deadTask._id);
                  }
                } else {
                  throw e;
                }
              }
            }),
          );
        }
      }),
    );

    return remoteEntities;
  }

  async processEntity(
    entity: any,
    entityType: "merge_request" | "issue",
    projectId: string,
  ): Promise<ITask | null> {
    const existingTask = await this.taskService.findOneAsync({
      gitlabId: entity.id,
    });
    if (existingTask?.deleted) return null;

    const taskData = createTaskData(entity, entityType);

    taskData.discussions = await this.getDiscussionsAsync(
      projectId,
      entity.iid,
      `${entityType}s`,
    );

    if (taskData.type === "merge_request") {
      const pipelineState = await this.getPipelineState(taskData);
      taskData.pipelineStatus = pipelineState.pipelineStatus;
      taskData.latestPipelineId = pipelineState.latestPipelineId;
      taskData.pipelineReports = pipelineState.pipelineReports;
    }

    let taskResult: any = null;
    if (existingTask) {
      if (
        !deepEqual(existingTask, taskData, ["description", "title", "status"])
      ) {
        taskResult = await this.taskService.updateTaskAsync(
          existingTask._id as string,
          {
            labels: taskData.labels,
            branch: taskData.branch,
            pipelineStatus: taskData.pipelineStatus,
            latestPipelineId: taskData.latestPipelineId,
            pipelineReports: taskData.pipelineReports,
            discussions: taskData.discussions,
            assignee: taskData.assignee,
            milestoneId: taskData.milestoneId,
          },
        );
      } else {
        return null;
      }
    } else {
      taskResult = await this.taskEmitter.createTaskAsync(projectId, taskData);
    }

    if (taskResult?.error) throw taskResult.error;
    return taskResult?.data;
  }

  async getDiscussionsAsync(
    projectId: string,
    gitlabIid: number,
    type: string,
  ): Promise<any[]> {
    let pagination = {
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
      pagination.totalPages = nextPagination.totalPages;
    } while (pagination.currentPage < (pagination.totalPages ?? 1));

    return totalDiscussions.map(transformDiscussion);
  }

  async getPipelineState(task: Partial<ITask>) {
    const result = {
      pipelineStatus: "",
      latestPipelineId: 0,
      pipelineReports: [] as any[],
    };

    const pipelines = await this.gitlabApiClient.request(
      `/projects/${task.projectId}/merge_requests/${task.gitlabIid}/pipelines`,
    );
    const pipeline = pipelines.length ? pipelines[0] : null;
    if (pipeline) {
      result.pipelineStatus = pipeline.status;
      result.latestPipelineId = pipeline.id;
      if (pipeline.status === "failed") {
        try {
          const report = await this.gitlabApiClient.request(
            `/projects/${task.projectId}/pipelines/${pipeline.id}/test_report?per_page=100`,
          );
          const failedTests = report.test_suites.flatMap((suite: any) =>
            suite.test_cases.filter((test: any) => test.status === "failed"),
          );
          result.pipelineReports = failedTests.map((test: any) => ({
            name: test.name ?? "Unknown",
            classname: test.classname ?? "Unknown",
            attachment_url: test.attachment_url ?? "",
          }));
        } catch (e: any) {
          throw new MochiError("Failed to fetch pipeline test report", 500, e);
        }
      }
    }
    return result;
  }

  async fetchMyEntitiesFromGitlabAsync(
    endpoint: string,
    projectId: string,
    userId: string,
  ): Promise<any[]> {
    return await fetchAllFromPaginatedApiAsync((pagination) =>
      this.gitlabApiClient.paginatedRequest(
        `/projects/${projectId}/${endpoint}/?assignee_id=${userId}&page=${pagination.currentPage}&per_page=${pagination.limit}`,
      ),
    );
  }
}
