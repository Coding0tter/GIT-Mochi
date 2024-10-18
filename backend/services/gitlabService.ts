// services/GitlabService.ts

import { SettingRepo } from "../repositories/settingRepo";
import {
  createTaskData,
  detectChanges,
  parseComments,
} from "../utils/taskUtils";
import SocketHandler from "../sockets";
import { GitlabApiClient } from "../clients/gitlabApiClient";
import { TaskService } from "./taskService";
import { UserService } from "./userService";
import { GitlabError } from "../errors/gitlabError";
import type { ITask } from "../models/task";
import { ContextKeys, getContext } from "../utils/asyncContext";

export class GitlabService {
  private gitlabApiClient: GitlabApiClient;
  private taskService: TaskService;
  private userService: UserService;
  private settingRepo: SettingRepo;

  constructor() {
    this.gitlabApiClient = new GitlabApiClient();
    this.taskService = new TaskService();
    this.userService = new UserService();
    this.settingRepo = new SettingRepo();
  }

  async syncGitLabDataAsync(): Promise<ITask[]> {
    const user = await this.userService.getUser();
    const project = await this.settingRepo.getByKeyAsync("currentProject");

    if (!user) throw new GitlabError("No user found", 404);
    if (!project) throw new GitlabError("No project selected", 404);

    if (project.value.includes("custom_project")) {
      return [];
    }

    const [updatedMergeRequests, updatedIssues] = await Promise.all([
      this.syncEntities(
        "merge_requests",
        "merge_request",
        project.value,
        user.gitlabId.toString()
      ),
      this.syncEntities(
        "issues",
        "issue",
        project.value,
        user.gitlabId.toString()
      ),
    ]);

    return [...updatedMergeRequests, ...updatedIssues];
  }

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
      user.gitlabId.toString()
    );

    const newMergeRequestTask = await this.taskService.createTaskAsync(
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
      }
    );

    const comments = await this.getMergeRequestCommentsAsync(
      newMergeRequestTask.id
    );
    newMergeRequestTask.comments = comments;

    await this.taskService.updateTaskAsync(newMergeRequestTask.id, {
      comments: newMergeRequestTask.comments,
    });

    await this.taskService.updateTaskAsync(issue._id as string, {
      status: "closed",
    });

    SocketHandler.getInstance()
      .getIO()
      .emit("updateTasks", [
        newMergeRequestTask,
        { ...issue, status: "closed" },
      ]);

    return {
      mergeRequest: mergeRequestData,
    };
  }

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
    return this.gitlabApiClient.request("/projects");
  }

  async getMergeRequestCommentsAsync(taskId: string) {
    const mergeRequest = await this.taskService.findOneAsync({ _id: taskId });
    if (!mergeRequest) throw new GitlabError("Merge request not found", 404);

    const comments = await this.fetchMergeRequestCommentsAsync(
      mergeRequest.projectId!,
      mergeRequest.gitlabIid?.toString()!
    );

    return parseComments(comments, mergeRequest.projectId!);
  }

  async closeMergedMergeRequestsAsync(): Promise<Partial<ITask>[]> {
    const changes: Partial<ITask>[] = [];

    const openMergeRequests = await this.taskService.getAllAsync({
      type: "merge_request",
      status: "review",
    });

    for (const mr of openMergeRequests) {
      const mergeRequest = await this.gitlabApiClient.request(
        `/projects/${mr.projectId}/merge_requests/${mr.gitlabIid}`
      );

      if (mergeRequest.state === "merged") {
        await this.taskService.updateTaskAsync(mr._id as string, {
          status: "closed",
        });
        changes.push({ ...mr, status: "closed" });
      }
    }

    return changes;
  }

  private async syncEntities(
    endpoint: string,
    entityType: "merge_request" | "issue",
    projectId: string,
    userId: string
  ): Promise<ITask[]> {
    const entities = await this.fetchEntitiesFromGitlab(
      endpoint,
      projectId,
      userId
    );
    const updatedTasks: ITask[] = [];

    for (const entity of entities) {
      const task = await this.processEntity(entity, entityType, projectId);
      if (task) {
        updatedTasks.push(task);
      }
    }

    return updatedTasks;
  }

  private async fetchEntitiesFromGitlab(
    endpoint: string,
    projectId: string,
    userId: string
  ): Promise<any[]> {
    return this.gitlabApiClient.request(
      `/projects/${projectId}/${endpoint}?assignee_id=${userId}`
    );
  }

  private async processEntity(
    entity: any,
    entityType: "merge_request" | "issue",
    projectId: string
  ): Promise<ITask | null> {
    const existingTask = await this.taskService.findOneAsync({
      gitlabId: entity.id,
    });

    const taskData = createTaskData(entity, entityType);

    let task: ITask | null = null;

    if (existingTask) {
      const hasChanges = detectChanges(existingTask, taskData);
      if (hasChanges) {
        task = await this.taskService.updateTaskAsync(
          existingTask._id as string,
          {
            labels: taskData.labels,
            branch: taskData.branch,
          }
        );
      }
    } else {
      task = await this.taskService.createTaskAsync(projectId, taskData);
    }

    if (task && entityType === "merge_request") {
      const comments = await this.getMergeRequestCommentsAsync(task.id);
      task.comments = comments;
      await this.taskService.updateTaskAsync(task._id as string, {
        comments: task.comments,
      });
    }

    return task;
  }

  private async createBranch(projectId: string, issue: ITask) {
    await this.gitlabApiClient.request(
      `/projects/${projectId}/repository/branches`,
      "POST",
      {
        id: projectId,
        branch: issue.gitlabIid,
        ref: "develop",
      }
    );
  }

  private async createMergeRequest(
    projectId: string,
    issue: ITask,
    userId: string
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
      }
    );
  }

  private async fetchMergeRequestCommentsAsync(
    projectId: string,
    mergeRequestIid: string
  ) {
    return this.gitlabApiClient.request(
      `/projects/${projectId}/merge_requests/${mergeRequestIid}/notes`
    );
  }
}
