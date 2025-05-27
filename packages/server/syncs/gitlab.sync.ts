import { MochiError } from "@server/errors/mochi.error";
import { SettingRepo } from "@server/repositories/setting.repo";
import TaskEventEmitter from "@server/services/emitters/taskEventEmitter";
import TaskService from "@server/services/task.service";
import { UserService } from "@server/services/user.service";
import { createTaskData } from "@server/utils/taskUtils";
import type { Syncer } from "shared/types/syncer";
import type { ITask } from "shared/types/task";
import { logInfo } from "@server/utils/logger";
import { SettingKeys } from "shared";
import { GitlabClient } from "@server/clients/gitlab.client";
import PipelineProcessor from "./gitlab/pipeline.processor";
import NoteCountProcessor from "./gitlab/noteCount.processor";

export class GitlabSync implements Syncer {
  name = "GitLab";

  private client = new GitlabClient();
  private settingsRepo = new SettingRepo();
  private userService = new UserService();
  private taskService = new TaskService();
  private taskEmitter = new TaskEventEmitter();

  private fieldProcessors: any[] = [
    new PipelineProcessor(),
    new NoteCountProcessor(),
  ];

  public async sync(fullSync: boolean = false): Promise<ITask[]> {
    logInfo("Syncing GitLab data...");
    const lastSync = await this.settingsRepo.getByKeyAsync(
      SettingKeys.LAST_SYNC,
    );
    const project = await this.settingsRepo.getByKeyAsync(
      SettingKeys.CURRENT_PROJECT,
    );
    const user = await this.userService.getUser();

    if (!user || !project?.value) {
      return [];
    }

    const lastSyncDate = lastSync
      ? new Date(new Date(lastSync.value).setHours(0))
      : null;

    const [mergeRequestUpdates, issueUpdates] = await Promise.all([
      this.syncEntities(
        "merge_request",
        project.value,
        user.gitlabId,
        fullSync ? null : lastSyncDate,
      ),
      this.syncEntities(
        "issue",
        project.value,
        user.gitlabId,
        fullSync ? null : lastSyncDate,
      ),
    ]);

    this.settingsRepo.setByKeyAsync(
      SettingKeys.LAST_SYNC,
      new Date().toISOString(),
    );

    logInfo("Finished syncing GitLab data...");
    return [...mergeRequestUpdates, ...issueUpdates];
  }

  private async syncEntities(
    type: "merge_request" | "issue",
    projectId: string,
    userId: number,
    lastSyncDate: Date | null,
  ): Promise<ITask[]> {
    const myEntities = await this.client.getMyEntities(
      type,
      userId,
      projectId,
      lastSyncDate,
    );

    const localEntities = await this.taskService.getAllAsync({
      custom: false,
      deleted: false,
      gitlabId: { $ne: null },
      type: type,
    });

    const [otherEntities, deadTasks] = await this.client.getOtherEntities(
      type,
      projectId,
      localEntities.map((t) => t.gitlabIid!),
      lastSyncDate,
    );

    await Promise.all(
      deadTasks.map(
        async (item) => await this.taskService.setDeletedAsync(item),
      ),
    );

    const updateTasks = await Promise.all(
      [...myEntities, ...otherEntities].map(
        async (entity) => await this.processEntity(entity, type, projectId),
      ),
    );

    return updateTasks.filter((t) => t && !t.deleted) as ITask[];
  }

  private async processEntity(
    entity: any,
    entityType: "merge_request" | "issue",
    projectId: string,
  ) {
    const existingTask = await this.taskService.findOneAsync({
      gitlabId: entity.id,
    });

    if (existingTask?.deleted) return null;
    if (!entity.assignee) {
      return null;
    }

    const taskData = createTaskData(entity, entityType);

    for (const processor of this.fieldProcessors) {
      if (processor.shouldProcess(taskData)) {
        try {
          await processor.process(entity, taskData, projectId);
        } catch (e: any) {
          throw new MochiError(
            `Error processing ${processor.fieldName} for ${taskData.title}: ${e.message}`,
          );
        }
      }
    }

    let result: any;
    if (existingTask) {
      result = await this.taskService.updateTaskAsync(existingTask._id, {
        title: taskData.title,
        labels: taskData.labels,
        draft: taskData.draft,
        branch: taskData.branch,
        relevantDiscussionCount: taskData.relevantDiscussionCount ?? 0,
        pipelineStatus: taskData.pipelineStatus,
        latestPipelineId: taskData.latestPipelineId,
        pipelineReports: taskData.pipelineReports,
        assignee: taskData.assignee,
        milestoneId: taskData.milestoneId,
      });
    } else {
      result = await this.taskEmitter.createTaskAsync(projectId, taskData);
    }

    if (result?.error) throw result.error;

    return result?.data;
  }
}
