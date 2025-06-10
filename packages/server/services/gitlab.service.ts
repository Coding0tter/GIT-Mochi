import { GitlabClient } from "@server/clients/gitlab.client";
import { ruleEvent } from "@server/decorators/ruleEvent.decorator";
import { GitlabError } from "@server/errors/gitlab.error";
import { MochiError } from "@server/errors/mochi.error";
import { EventNamespaces, EventTypes } from "@server/events/eventTypes";
import TaskEventEmitter from "@server/services/emitters/taskEventEmitter";
import TaskService from "@server/services/task.service";
import { UserService } from "@server/services/user.service";
import SocketHandler from "@server/sockets";
import { ContextKeys, getContext } from "@server/utils/asyncContext";
import { fetchAllFromPaginatedApiAsync } from "@server/utils/fetchAllFromPaginatedApi";
    if (!/^[A-Za-z0-9._-]+$/.test(desiredBranch)) {
      throw new GitlabError("Invalid branch name", 400);
    }
    if (!branchName) {
      throw new GitlabError("Invalid branch name", 400);
    }
import { transformNote } from "@server/utils/transformHelpers";
import type { IDiscussion, ITask } from "shared/types/task";

export class GitlabService {
  private taskService = new TaskService();
  private taskEmitter = new TaskEventEmitter();
  private userService = new UserService();
  private gitlabClient = new GitlabClient();

  async createGitlabMergeRequestAsync(issueId: string, branchName?: string) {
    const currentProject = getContext(ContextKeys.Project);
    if (!currentProject) throw new GitlabError("No project selected", 404);

    const issue = await this.taskService.findOneAsync({
      gitlabIid: parseInt(issueId),
    });
    if (!issue) throw new GitlabError("Issue not found", 404);

    const desiredBranch = branchName ?? issue.gitlabIid!.toString();
    try {
      await this.createBranch(currentProject.id, desiredBranch);
    } catch (e) {
      if (!branchName && e instanceof MochiError) {
        throw new MochiError("Branch creation failed", e.statusCode, e);
      }
      throw e;
    }

    const user = await this.getUserByAccessTokenAsync();
    if (!user) throw new GitlabError("No current user found", 404);

    const mergeRequestData = await this.createMergeRequest(
      currentProject.id,
      issue,
      user.gitlabId.toString(),
      desiredBranch,
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
  private async createBranch(projectId: string, branchName: string) {
    await this.gitlabClient.request({
      endpoint: `/projects/${projectId}/repository/branches`,
      method: "POST",
      data: {
        id: projectId,
        branch: branchName,
        ref: "develop",
      },
    });
  }

  private async createMergeRequest(
    projectId: string,
    issue: ITask,
    userId: string,
    branchName: string,
  ) {
    return this.gitlabClient.request({
      endpoint: `/projects/${projectId}/merge_requests`,
      method: "POST",
      data: {
        id: projectId,
        source_branch: branchName,
        target_branch: "develop",
        title: `Draft: Resolve "${issue.title}"`,
        description: `Closes #${issue.gitlabIid}`,
        assignee_id: userId,
        labels: issue.labels?.join(","),
        milestone_id: issue.milestoneId,
      },
    });
  }

  async closeMergedMergeRequestsAsync(): Promise<Partial<ITask>[]> {
    const changes: Partial<ITask>[] = [];

    const openMergeRequests = await this.taskService.getAllAsync({
      type: "merge_request",
      status: { $nin: ["closed"] },
    });

    const staleIssues = await this.taskService.getAllAsync({
      type: "issue",
      status: { $nin: ["closed"] },
    });

    for (const task of staleIssues) {
      const taskRequest = await this.gitlabClient.request({
        endpoint: `/projects/${task.projectId}/issues/${task.gitlabIid}`,
        method: "GET",
      });

      if (taskRequest.state === "closed") {
        await this.taskService.setDeletedAsync(task._id as string);
      }
    }

    for (const mr of openMergeRequests) {
      const mergeRequest = await this.gitlabClient.request({
        endpoint: `/projects/${mr.projectId}/merge_requests/${mr.gitlabIid}`,
        method: "GET",
      });
      if (mergeRequest.state === "merged" || mergeRequest.state === "closed") {
        await this.taskEmitter.updateTaskAsync(mr._id as string, {
          status: "closed",
        });
        changes.push({ ...mr, status: "closed" });
      }
    }

    return changes;
  }

  async resolveThreadAsync(task: ITask, discussion: IDiscussion) {
    const payload = { resolved: true };
    const response = await this.gitlabClient.request({
      endpoint: `/projects/${task.projectId}/merge_requests/${task.gitlabIid}/discussions/${discussion.discussionId}`,
      method: "PUT",
      data: payload,
    });

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

    const response = await this.gitlabClient.request({
      endpoint: `/projects/${task.projectId}/${
        task.type === "issue" ? "issues" : "merge_requests"
      }/${task.gitlabIid}/discussions/${discussion.discussionId}/notes`,
      method: "POST",
      data: payload,
    });

    const updatedTask = await this.taskService.findOneAsync({ _id: task._id });
    if (updatedTask.discussions) {
      updatedTask.discussions = updatedTask.discussions.map((d) => {
        if (d.discussionId === discussion.discussionId) {
          const note = transformNote(response);
          d.notes?.push(note);
        }
        return d;
      });
    }
    SocketHandler.getInstance().getIO().emit("updateTasks", [updatedTask]);
    return response;
  }

  async getUserByAccessTokenAsync() {
    const response = await this.gitlabClient.getUserByAccessToken();
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
    return this.gitlabClient.request({
      endpoint: "/projects?per_page=100",
      method: "GET",
    });
  }

  async getTodosAsync() {
    return await fetchAllFromPaginatedApiAsync(
      async (pagination) =>
        await this.gitlabClient.paginatedRequest({
          endpoint: `/todos?page=${pagination.currentPage}&per_page=${pagination.limit}`,
          method: "GET",
        }),
    );
  }

  async getUsersAsync() {
    return this.gitlabClient.request({
      endpoint: "/users?per_page=100",
      method: "GET",
    });
  }

  async assignToUserAsync(taskId: string, userId: string) {
    const task = await this.taskService.findOneAsync({ _id: taskId });
    if (!task) throw new MochiError("Task not found", 404);
    await this.gitlabClient.updateAssignee(
      task.projectId!,
      task.gitlabIid!.toString(),
      userId,
    );
  }

  async markTodoAsDone(id: string) {
    if (!id) throw new MochiError("Todo ID is required", 400);

    await this.gitlabClient.request({
      endpoint: `/todos/${id}/mark_as_done`,
      method: "POST",
    });
  }

  async toggleDraft(taskId: string) {
    const task = await this.taskService.findOneAsync({ _id: taskId });
    if (!task) throw new MochiError("Task not found", 404);
    await this.gitlabClient.request({
      endpoint: `/projects/${task.projectId}/merge_requests/${task.gitlabIid}`,
      method: "PUT",
      data: { title: task.title.replaceAll("Draft:", ""), draft: !task.draft },
    });
  }
}
