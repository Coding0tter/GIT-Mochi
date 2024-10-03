import axios from "axios";
import { type ITask } from "../models/task";
import { MochiError } from "../utils/error";
import { TaskRepo } from "../repositories/taskRepo";
import { SettingRepo } from "../repositories/settingRepo";
import { UserRepo } from "../repositories/userRepo";

export class GitlabService {
  private taskRepo: TaskRepo;
  private settingRepo: SettingRepo;
  private userRepo: UserRepo;

  constructor() {
    this.taskRepo = new TaskRepo();
    this.settingRepo = new SettingRepo();
    this.userRepo = new UserRepo();
  }

  syncGitLabData = async () => {
    await this.syncMergeRequests();
    await this.syncIssues();
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

  private async syncMergeRequests() {
    try {
      const mergeRequestResponse = await axios.get(
        `${process.env.GIT_API_URL}/merge_requests?scope=assigned_to_me`,
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
          newTask = await this.taskRepo.updateAsync(
            existingTask._id as string,
            taskData
          );
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
  }

  private async syncIssues() {
    try {
      const issuesResponse = await axios.get(
        `${process.env.GIT_API_URL}/issues?scope=assigned_to_me`,
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
          await this.taskRepo.updateAsync(existingTask._id as string, taskData);
        } else {
          await this.taskRepo.createAsync({
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
        }
      }
    } catch (error) {
      throw new MochiError("Failed to sync issues", 500, error as Error);
    }
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
