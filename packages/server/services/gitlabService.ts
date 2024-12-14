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
import { getContext, ContextKeys } from "@server/utils/asyncContext";
import type { MochiResult } from "@server/utils/mochiResult";
import { createTaskData, detectChanges } from "@server/utils/taskUtils";
import type { ITask, IComment, IDiscussion } from "shared/types/task";
import type { IPagination } from "shared/types/pagination";

export class GitlabService {
  private gitlabApiClient: GitlabApiClient;
  private taskService: TaskService;
  private taskEmitter: TaskEventEmitter;
  private userService: UserService;
  private settingRepo: SettingRepo;

  constructor() {
    this.gitlabApiClient = new GitlabApiClient();
    this.taskService = new TaskService();
    this.taskEmitter = new TaskEventEmitter();
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
      }
    );

    if (newMergeRequestTaskResult.error) {
      throw newMergeRequestTaskResult.error;
    }

    const newMergeRequestTask = newMergeRequestTaskResult.data;

    const comments = await this.getMergeRequestCommentsAsync(
      newMergeRequestTask.projectId,
      newMergeRequestTask.gitlabIid
    );
    newMergeRequestTask.comments = comments;

    await this.taskEmitter.updateTaskAsync(newMergeRequestTask.id, {
      comments: newMergeRequestTask.comments,
    });

    await this.taskEmitter.updateTaskAsync(issue._id as string, {
      status: "closed",
    });

    SocketHandler.getInstance()
      .getIO()
      .emit("updateTasks", [
        newMergeRequestTask,
        { _id: issue._id, status: "closed" },
      ]);

    return {
      mergeRequest: mergeRequestData,
    };
  }

  async commentOnTaskAsync(
    task: ITask,
    discussion: IDiscussion,
    reply: string
  ) {
    const payload = {
      body: reply,
      type: "DiscussionNote",
      discussion_id: discussion.discussionId,
      note_id: discussion.notes?.at(0)?.noteId,
      issue_iid: task.gitlabIid,
      merge_request_iid: task.gitlabIid,
    };

    const response = await this.gitlabApiClient.request(
      `/projects/${task.projectId}/${
        task.type === "issue" ? "issues" : "merge_requests"
      }/${task.gitlabIid}/discussions/${discussion.discussionId}/notes`,
      "POST",
      payload
    );

    const updateTask = await this.taskService.findOneAsync({ _id: task._id });

    updateTask.discussions = updateTask.discussions?.map((d) => {
      if (d.discussionId === discussion.discussionId) {
        const note = response;

        note.noteId = note.id.toString();
        delete note.id;
        note.author.authorId = note.author.id.toString();
        note.resolved = note.resolved || false;
        if (note.resolved) {
          note.resolved_by.authorId = note.resolved_by.id.toString();
        }

        d.notes?.push(note);
      }
      return d;
    });

    SocketHandler.getInstance().getIO().emit("updateTasks", [updateTask]);

    return response;
  }

  async assignToUserAsync(taskId: string, userId: string) {
    const task = await this.taskService.findOneAsync({ _id: taskId });
    if (!task) throw new MochiError("Task not found", 404);

    await this.gitlabApiClient.request(
      `/projects/${task.projectId}/merge_requests/${task.gitlabIid}`,
      "PUT",
      { assignee_id: userId }
    );
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
    return this.gitlabApiClient.request("/projects?per_page=100");
  }

  async getUsersAsync() {
    return this.gitlabApiClient.request("/users?per_page=100");
  }

  async getMergeRequestCommentsAsync(projectId: string, gitlabIid: string) {
    const comments = await this.fetchMergeRequestCommentsAsync(
      projectId,
      gitlabIid
    );

    comments.forEach((comment: any) => {
      comment.originalId = comment.id;
    });
    return comments;
  }

  async getDiscussionsAsync(
    projectId: string,
    gitlabIid: string,
    type: string
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
          `/projects/${projectId}/${type}/${gitlabIid}/discussions?page${pagination.currentPage}&per_page=${pagination.limit}`
        );

      totalDiscussions = totalDiscussions.concat(data);

      pagination.currentPage = nextPagination.nextPage;
    } while (pagination.currentPage < (pagination.totalPages ?? 1));

    totalDiscussions.forEach((discussion: any) => {
      discussion.discussionId = discussion.id.toString();
      delete discussion.id;
      discussion.notes.forEach((note: any) => {
        note.noteId = note.id.toString();
        delete note.id;
        note.author.authorId = note.author.id.toString();
        note.resolved = note.resolved || false;
        if (note.resolved) {
          note.resolved_by.authorId = note.resolved_by.id.toString();
        }
      });
    });

    return totalDiscussions;
  }

  async getDiscussionsPaginatedAsync(
    taskId: string,
    pagination: Pick<IPagination, "currentPage" | "limit">
  ) {
    const task = await this.taskService.findOneAsync({ _id: taskId });

    const { data: discussions, pagination: resultPagination } =
      await this.gitlabApiClient.paginatedRequest(
        `/projects/${task.projectId}/${
          task.type === "issue" ? "issues" : "merge_requests"
        }/${task.gitlabIid}/discussions?per_page=${pagination.limit}&page=${
          pagination.currentPage
        }&order_by=created_at&sort=asc`
      );

    discussions.forEach((discussion: any) => {
      discussion.discussionId = discussion.id.toString();
      delete discussion.id;
      discussion.notes.forEach((note: any) => {
        note.noteId = note.id.toString();
        delete note.id;
        note.author.authorId = note.author.id.toString();
        if (note.resolved) {
          note.resolved_by.authorId = note.resolved_by.id.toString();
        }
      });
    });

    return { data: discussions, pagination: resultPagination };
  }

  async getLatestPipelineAsync(projectId: string, mergeRequestIid: string) {
    const pipelines = await this.gitlabApiClient.request(
      `/projects/${projectId}/merge_requests/${mergeRequestIid}/pipelines`
    );

    if (pipelines.length === 0) {
      return null;
    }

    return pipelines[0];
  }

  async getFaultyTestCasesAsync(projectId: string, pipelineId: number) {
    const report = await this.gitlabApiClient.request(
      `/projects/${projectId}/pipelines/${pipelineId}/test_report?per_page=100`
    );

    const cases = report.test_suites.flatMap((suite: any) => {
      return suite.test_cases.filter((test: any) => test.status === "failed");
    });

    return cases;
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
        await this.taskEmitter.updateTaskAsync(mr._id as string, {
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
      if (task && !task.deleted) {
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
      `/projects/${projectId}/${endpoint}?assignee_id=${userId}&per_page=100`
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

    let taskResult: MochiResult | null = null;
    let comments: IComment[];

    if (entityType === "merge_request") {
      comments = await this.getMergeRequestCommentsAsync(projectId, entity.iid);
      taskData.comments = comments;
    }

    if (existingTask) {
      const hasChanges = detectChanges(existingTask, taskData);
      if (hasChanges) {
        taskResult = await this.taskService.updateTaskAsync(
          existingTask._id as string,
          {
            labels: taskData.labels,
            branch: taskData.branch,
          }
        );
      }
    } else {
      taskResult = await this.taskEmitter.createTaskAsync(projectId, taskData);
    }

    if (taskResult?.error) {
      throw taskResult.error;
    }

    return taskResult?.data;
  }

  @ruleEvent(EventNamespaces.GitLab, EventTypes.CreateBranch)
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