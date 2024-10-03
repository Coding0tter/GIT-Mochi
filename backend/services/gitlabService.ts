import axios from "axios";
import { type ITask } from "../models/task";
import { MochiError } from "../utils/error";
import { TaskRepo } from "../repositories/taskRepo";
import { SettingRepo } from "../repositories/settingRepo";
import { UserRepo } from "../repositories/userRepo";
import { addNotification } from "../../kanban-board/src/services/notificationService";

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

    const updatedMergeRequest = await this.syncMergeRequests(
      project.value,
      user.gitlabId.toString()
    );
    const updatedIssues = await this.syncIssues(
      project.value,
      user.gitlabId.toString()
    );

    return [...updatedMergeRequest, ...updatedIssues];
  };

  createGitlabMergeRequestAsync = async (issueId: string) => {
    try {
      const currentProjectId = await this.settingRepo.getByKeyAsync(
        "currentProject"
      );

      if (!currentProjectId) throw new MochiError("No project selected", 404);

      const issue = await this.taskRepo.findOneAsync({ gitlabIid: issueId });
      if (!issue) throw new MochiError("Issue not found", 404);

      const createBranchResponse = await axios.post(
        `${process.env.GIT_API_URL}/projects/${currentProjectId.value}/repository/branches`,
        {
          id: currentProjectId.value,
          branch: issue.gitlabIid,
          ref: "develop",
        },
        {
          headers: {
            "PRIVATE-TOKEN": process.env.PRIVATE_TOKEN,
            "Content-Type": "application/json",
          },
        }
      );

      const createBranchData = await createBranchResponse.data;
      if (createBranchData.message === "Branch already exists")
        throw new MochiError("Branch already exists", 400);

      const user = await this.getUserByAccessTokenAsync();

      if (!user) throw new MochiError("No current user found", 404);

      const createMergeRequestResponse = await axios.post(
        `${process.env.GIT_API_URL}/projects/${currentProjectId.value}/merge_requests`,
        {
          id: currentProjectId.value,
          source_branch: issue.gitlabIid,
          target_branch: "develop",
          title: `Draft: Resolve "${issue.title}"`,
          description: `Closes #${issue.gitlabIid}`,
          assignee_id: user.gitlabId,
          labels: issue.labels?.join(","),
          milestone_id: issue.milestoneId,
        },
        {
          headers: {
            "PRIVATE-TOKEN": process.env.PRIVATE_TOKEN,
            "Content-Type": "application/json",
          },
        }
      );

      await this.taskRepo.updateAsync(issue._id as string, {
        status: "closed",
      });

      return {
        branch: createBranchData,
        mergeRequest: createMergeRequestResponse.data,
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
      const response = await axios.get(`${process.env.GIT_API_URL}/user`, {
        headers: { "PRIVATE-TOKEN": process.env.PRIVATE_TOKEN },
      });

      if (response.status !== 200)
        throw new MochiError("Error fetching user data", response.status);

      const userData = response.data;
      let user = await this.userRepo.findOneAsync({ gitlabId: userData.id });

      if (!user) {
        user = await this.userRepo.createAsync({
          gitlabId: userData.id,
          username: userData.username,
          email: userData.email,
          name: userData.name,
          avatar_url: userData.avatar_url,
        });
      }

      return user;
    } catch (error) {
      throw new MochiError(
        "Failed to get user from gitlab",
        500,
        error as Error
      );
    }
  };

  getProjectsAsync = async () => {
    try {
      const projectsResponse = await axios.get(
        `${process.env.GIT_API_URL}/projects`,
        {
          headers: { "PRIVATE-TOKEN": process.env.PRIVATE_TOKEN },
        }
      );

      return projectsResponse.data;
    } catch (error) {
      throw new MochiError(
        "Failed to get projects from gitlab",
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
        "Failed to get merge request comments from gitlab",
        500,
        error as Error
      );
    }
  };

  private async syncMergeRequests(projectId: string, userId: string) {
    const updatedTasks = [] as ITask[];

    try {
      console.log(
        `${process.env.GIT_API_URL}/projects/${projectId}/merge_requests?assignee_id=${userId}`
      );
      const mergeRequestResponse = await axios.get(
        `${process.env.GIT_API_URL}/projects/${projectId}/merge_requests?assignee_id=${userId}`,
        {
          headers: { "PRIVATE-TOKEN": process.env.PRIVATE_TOKEN },
        }
      );

      const gitlabMergeRequests = mergeRequestResponse.data;

      for (const mr of gitlabMergeRequests) {
        const existingTask = await this.taskRepo.findOneAsync({
          gitlabId: mr.id,
        });

        const taskData = {
          labels: mr.labels,
          branch: mr.source_branch,
        };

        let newTask = {} as ITask;

        if (existingTask) {
          const hasChanges = this.detectChanges(existingTask, taskData);

          if (hasChanges) {
            newTask = await this.taskRepo.updateAsync(
              existingTask._id as string,
              taskData
            );

            updatedTasks.push(newTask);
          }
        } else {
          newTask = await this.taskRepo.createAsync({
            ...taskData,
            projectId: mr.project_id,
            gitlabId: mr.id,
            web_url: mr.web_url,
            type: "merge_request",
            gitlabIid: mr.iid,
            title: mr.title,
            description: mr.description,
            status: mr.state,
            custom: false,
          });

          updatedTasks.push(newTask);
        }

        newTask.comments = await this.getMergeRequestCommentsAsync(
          newTask._id as string
        );

        await this.taskRepo.updateAsync(newTask._id as string, newTask);
      }
    } catch (error) {
      throw new MochiError(
        "Failed to sync merge requests",
        500,
        error as Error
      );
    }

    return updatedTasks;
  }

  private async syncIssues(projectId: string, userId: string) {
    const updatedTasks = [] as ITask[];
    try {
      const issuesResponse = await axios.get(
        `${process.env.GIT_API_URL}/projects/${projectId}/issues?assignee_id=${userId}`,
        {
          headers: { "PRIVATE-TOKEN": process.env.PRIVATE_TOKEN },
        }
      );
      const issues = await issuesResponse.data;

      for (const issue of issues) {
        const existingTask = await this.taskRepo.findOneAsync({
          gitlabId: issue.id,
        });

        const taskData = {
          labels: issue.labels,
          milestoneId: issue.milestone?.id,
          milestoneName: issue.milestone?.title,
        };

        if (existingTask) {
          const hasChanges = this.detectChanges(existingTask, taskData);

          if (hasChanges) {
            const updatedTask = await this.taskRepo.updateAsync(
              existingTask._id as string,
              taskData
            );
            updatedTasks.push(updatedTask);
          }
        } else {
          const newTask = await this.taskRepo.createAsync({
            gitlabId: issue.id,
            gitlabIid: issue.iid,
            projectId: issue.project_id,
            web_url: issue.web_url,
            ...taskData,
            type: "issue",
            status: "opened",
            custom: false,
            title: issue.title,
            description: issue.description,
          });

          updatedTasks.push(newTask);
        }
      }
    } catch (error) {
      throw new MochiError("Failed to sync issues", 500, error as Error);
    }

    return updatedTasks;
  }

  private detectChanges(
    existingTask: ITask,
    taskData: Partial<ITask>
  ): boolean {
    // Compare each key in taskData with existingTask
    for (const key of Object.keys(taskData)) {
      if (taskData[key as keyof ITask] !== existingTask[key as keyof ITask]) {
        return true; // Changes detected
      }
    }
    return false; // No changes
  }

  private fetchMergeRequestCommentsAsync = async (
    projectId: string,
    mergeRequestIid: string
  ) => {
    try {
      const commentsResponse = await axios.get(
        `${process.env.GIT_API_URL}/projects/${projectId}/merge_requests/${mergeRequestIid}/notes`,
        {
          headers: {
            "PRIVATE-TOKEN": process.env.PRIVATE_TOKEN,
          },
        }
      );

      return commentsResponse.data;
    } catch (error) {
      throw new MochiError(
        "Failed to fetch merge request comments",
        500,
        error as Error
      );
    }
  };

  private parseComments = (projectId: string, comments: any) => {
    try {
      if (Array.isArray(comments)) {
        const filteredAndProcessedComments = comments
          .filter(
            (comment: { system: boolean; author: { username: string } }) =>
              !comment.system && comment.author.username !== "merge_train"
          )
          .map((comment) => {
            const imageRegex = /!\[.*?\]\((.*?)\)/g;
            const matches = [...comment.body.matchAll(imageRegex)];
            const images = matches.map(
              (match) =>
                `${process.env.GIT_URL}/-/project/${projectId}` + match[1]
            );

            const cleanedText = comment.body.replace(imageRegex, "").trim();

            comment.body = cleanedText;
            comment.images = images;
            comment.originalId = comment.id;

            return comment;
          });

        return filteredAndProcessedComments;
      }
      return [];
    } catch (error) {
      throw new MochiError("Failed to parse comments", 500, error as Error);
    }
  };
}
