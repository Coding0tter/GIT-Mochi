import axios from "axios";
import { type ITask } from "../models/task";
import { MochiError } from "../utils/error";
import { TaskRepo } from "../repositories/taskRepo";
import { SettingRepo } from "../repositories/settingRepo";
import { UserRepo } from "../repositories/userRepo";
import SocketHandler from "../sockets";

export class GitlabService {
  private taskRepo: TaskRepo;
  private settingRepo: SettingRepo;
  private userRepo: UserRepo;

  constructor() {
    this.taskRepo = new TaskRepo();
    this.settingRepo = new SettingRepo();
    this.userRepo = new UserRepo();
  }

  syncGitLabDataAsync = async () => {
    const user = await this.userRepo.findOneAsync({});
    const project = await this.settingRepo.getByKeyAsync("currentProject");

    if (!user) throw new MochiError("No user found", 404);
    if (!project) throw new MochiError("No project selected", 404);

    if (project.value.includes("custom_project")) {
      return [];
    }

    const updatedMergeRequests = await this.syncEntities(
      "merge_requests",
      "merge_request",
      project.value,
      user.gitlabId.toString()
    );
    const updatedIssues = await this.syncEntities(
      "issues",
      "issue",
      project.value,
      user.gitlabId.toString()
    );

    return [...updatedMergeRequests, ...updatedIssues];
  };

  createGitlabMergeRequestAsync = async (issueId: string) => {
    try {
      const currentProjectId = await this.settingRepo.getByKeyAsync(
        "currentProject"
      );

      if (!currentProjectId) throw new MochiError("No project selected", 404);

      const issue = await this.taskRepo.findOneAsync({ gitlabIid: issueId });
      if (!issue) throw new MochiError("Issue not found", 404);

      const createBranchData = await this.createBranch(
        currentProjectId.value,
        issue
      );

      const user = await this.getUserByAccessTokenAsync();
      if (!user) throw new MochiError("No current user found", 404);

      const mergeRequestData = await this.createMergeRequest(
        currentProjectId.value,
        issue,
        user.gitlabId.toString()
      );

      const newMergeRequestTask = await this.taskRepo.createAsync({
        labels: mergeRequestData.labels,
        branch: mergeRequestData.source_branch,
        projectId: mergeRequestData.project_id,
        gitlabId: mergeRequestData.id,
        web_url: mergeRequestData.web_url,
        type: "merge_request",
        gitlabIid: mergeRequestData.iid,
        title: mergeRequestData.title,
        description: mergeRequestData.description,
        status: "inprogress",
        custom: false,
      });

      await this.taskRepo.updateAsync(issue._id as string, {
        status: "closed",
      });

      const comments = await this.getMergeRequestCommentsAsync(
        newMergeRequestTask.id
      );
      newMergeRequestTask.comments = comments;

      this.taskRepo.updateAsync(newMergeRequestTask.id, newMergeRequestTask);

      SocketHandler.getInstance()
        .getIO()
        .emit("updateTasks", [
          newMergeRequestTask,
          { ...issue, status: "closed" },
        ]);

      return {
        branch: createBranchData,
        mergeRequest: mergeRequestData,
      };
    } catch (error) {
      throw new MochiError(
        "Failed to create merge request",
        500,
        error as Error
      );
    }
  };

  getUserByAccessTokenAsync = async () => {
    try {
      const response = await this.makeGitlabRequest("/user");
      let user = await this.userRepo.findOneAsync({ gitlabId: response.id });

      if (!user) {
        user = await this.userRepo.createAsync({
          gitlabId: response.id,
          username: response.username,
          email: response.email,
          name: response.name,
          avatar_url: response.avatar_url,
        });
      }

      return user;
    } catch (error) {
      throw new MochiError(
        "Failed to get user from GitLab",
        500,
        error as Error
      );
    }
  };

  getProjectsAsync = async () => {
    try {
      return await this.makeGitlabRequest("/projects");
    } catch (error) {
      throw new MochiError(
        "Failed to get projects from GitLab",
        500,
        error as Error
      );
    }
  };

  getMergeRequestCommentsAsync = async (mergeRequestId: string) => {
    try {
      const mergeRequest = await this.taskRepo.getByIdAsync(mergeRequestId);
      if (!mergeRequest) throw new MochiError("Merge request not found", 404);

      const comments = await this.fetchMergeRequestCommentsAsync(
        mergeRequest.projectId!,
        mergeRequest.gitlabIid?.toString()!
      );
      return this.parseComments(mergeRequest.projectId!, comments);
    } catch (error) {
      throw new MochiError(
        "Failed to get merge request comments from GitLab",
        500,
        error as Error
      );
    }
  };

  private async syncEntities(
    endpoint: string,
    entityType: "merge_request" | "issue",
    projectId: string,
    userId: string
  ): Promise<ITask[]> {
    try {
      const entities = await this.makeGitlabRequest(
        `/projects/${projectId}/${endpoint}?assignee_id=${userId}`
      );
      const updatedTasks: ITask[] = [];

      for (const entity of entities) {
        const existingTask = await this.taskRepo.findOneAsync({
          gitlabId: entity.id,
        });
        const taskData = this.createTaskData(entity, entityType);

        let task = {} as ITask;

        if (existingTask) {
          const hasChanges = this.detectChanges(existingTask, taskData);
          if (hasChanges) {
            const updatedTask = await this.taskRepo.updateAsync(
              existingTask._id as string,
              {
                labels: taskData.labels,
                branch: taskData.branch,
              }
            );
            updatedTasks.push(updatedTask);

            task = updatedTask;
          }
        } else {
          const newTask = await this.taskRepo.createAsync(taskData);
          updatedTasks.push(newTask);

          task = newTask;
        }

        if (entityType === "merge_request") {
          const comments = await this.getMergeRequestCommentsAsync(task.id);
          task.comments = comments;
          await this.taskRepo.updateAsync(task._id as string, task);
        }
      }

      return updatedTasks;
    } catch (error) {
      throw new MochiError(
        `Failed to sync ${entityType}s`,
        500,
        error as Error
      );
    }
  }

  private async createBranch(projectId: string, issue: ITask) {
    try {
      return await this.makeGitlabRequest(
        `/projects/${projectId}/repository/branches`,
        "POST",
        {
          id: projectId,
          branch: issue.gitlabIid,
          ref: "develop",
        }
      );
    } catch (error) {
      throw new MochiError("Failed to create branch", 500, error as Error);
    }
  }

  private async createMergeRequest(
    projectId: string,
    issue: ITask,
    userId: string
  ) {
    try {
      return await this.makeGitlabRequest(
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
    } catch (error) {
      throw new MochiError(
        "Failed to create merge request",
        500,
        error as Error
      );
    }
  }

  private async makeGitlabRequest(
    endpoint: string,
    method: "GET" | "POST" = "GET",
    data?: any
  ) {
    try {
      const response = await axios({
        url: `${process.env.GIT_API_URL}${endpoint}`,
        method,
        headers: {
          "PRIVATE-TOKEN": process.env.PRIVATE_TOKEN,
          "Content-Type": "application/json",
        },
        data,
      });

      if (response.status >= 400)
        throw new MochiError("GitLab API error", response.status);
      return response.data;
    } catch (error) {
      throw new MochiError("GitLab API request failed", 500, error as Error);
    }
  }

  private createTaskData(
    entity: any,
    entityType: "merge_request" | "issue"
  ): Partial<ITask> {
    return {
      labels: entity.labels,
      milestoneId: entityType === "issue" ? entity.milestone?.id : undefined,
      branch: entityType === "merge_request" ? entity.source_branch : undefined,
      projectId: entity.project_id,
      gitlabId: entity.id,
      gitlabIid: entity.iid,
      web_url: entity.web_url,
      type: entityType,
      title: entity.title,
      description: entity.description,
      status: entity.state || "opened",
      custom: false,
    };
  }

  private async fetchMergeRequestCommentsAsync(
    projectId: string,
    mergeRequestIid: string
  ) {
    try {
      return await this.makeGitlabRequest(
        `/projects/${projectId}/merge_requests/${mergeRequestIid}/notes`
      );
    } catch (error) {
      throw new MochiError(
        "Failed to fetch merge request comments",
        500,
        error as Error
      );
    }
  }

  private parseComments(projectId: string, comments: any) {
    return comments
      .filter(
        (comment: { system: boolean; author: { username: string } }) =>
          !comment.system && comment.author.username !== "merge_train"
      )
      .map((comment: any) => {
        const imageRegex = /!\[.*?\]\((.*?)\)/g;
        const matches = [...comment.body.matchAll(imageRegex)];
        const images = matches.map(
          (match) => `${process.env.GIT_URL}/-/project/${projectId}` + match[1]
        );

        comment.body = comment.body.replace(imageRegex, "").trim();
        comment.images = images;
        comment.originalId = comment.id;

        return comment;
      });
  }

  private detectChanges(
    existingTask: ITask,
    taskData: Partial<ITask>
  ): boolean {
    for (const key of Object.keys(taskData)) {
      if (taskData[key as keyof ITask] !== existingTask[key as keyof ITask]) {
        return true;
      }
    }
    return false;
  }
}
