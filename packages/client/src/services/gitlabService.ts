import axios from "axios";
import { keyboardNavigationStore } from "../stores/keyboardNavigationStore";
import { fetchTasksAsync, getColumnTasks } from "../stores/taskStore";
import {
  LoadingTarget,
  type Project,
  setLoading,
  uiStore,
} from "../stores/uiStore";
import { addNotification } from "./notificationService";
import { has } from "lodash";
import type { IDiscussion } from "shared/types/task";

export const syncGitlabAsync = async () => {
  try {
    setLoading(LoadingTarget.SyncGitlab);

    if (has(uiStore.currentProject, "_id")) {
      addNotification({
        title: "Warning",
        description: "Cannot sync custom projects",
        type: "warning",
      });
      return;
    }

    const res = await axios.post(`/git/sync`);
    if (res.status !== 200) {
      throw new Error("Failed to sync with GitLab");
    }
    await fetchTasksAsync();

    addNotification({
      title: "Synced with GitLab",
      description: "Tasks have been synced with GitLab",
      type: "success",
    });
  } catch (error) {
    addNotification({
      title: "Error",
      description: "Failed to sync with GitLab",
      type: "error",
    });
  } finally {
    setLoading(LoadingTarget.None);
  }
};

export const fetchDiscussionsPaginatedAsync = async (
  taskId: string,
  page: number = 1,
) => {
  try {
    const res = await axios.get(`/git/discussions`, {
      params: { taskId, page, limit: 20 },
    });

    return res.data;
  } catch (error) {
    addNotification({
      title: "Error",
      description: "Failed to fetch discussions",
      type: "error",
    });
  }
};

export const resolveThreadAsync = async (discussion: IDiscussion) => {
  try {
    const task = getColumnTasks().at(keyboardNavigationStore.selectedTaskIndex);
    const res = await axios.post(`/git/resolve`, {
      task,
      discussion,
    });

    if (res.status !== 200) {
      addNotification({
        title: "Error",
        description: "Failed to resolve thread",
        type: "error",
      });
      return;
    }

    addNotification({
      title: "Resolved thread",
      description: "The thread has been resolved",
      type: "success",
    });
  } catch (error) {
    addNotification({
      title: "Error",
      description: "Failed to resolve thread",
      type: "error",
    });
  }
};

export const replyToDiscussionAsync = async (
  discussion: IDiscussion,
  reply: string,
) => {
  try {
    const task = getColumnTasks().at(keyboardNavigationStore.selectedTaskIndex);
    const res = await axios.post(`/git/comment`, {
      task: task,
      discussion: discussion,
      reply,
    });

    if (res.status !== 200) {
      addNotification({
        title: "Error",
        description: "Failed to reply to comment",
        type: "error",
      });
      return;
    }

    addNotification({
      title: "Replied to comment",
      description: "Your reply has been posted",
      type: "success",
    });
  } catch (error) {
    addNotification({
      title: "Error",
      description: "Failed to reply to comment",
      type: "error",
    });
  }
};

export const toggleDraft = async (taskId: string) => {
  try {
    const res = await axios.post(`/git/assign`, { taskId });
    return res;
  } catch (error) {
    addNotification({
      title: "Error",
      description: "Failed to toggle draft flag for task",
      type: "error",
    });
  }
};

export const assignTaskAsync = async (taskId: string, userId: string) => {
  try {
    const res = await axios.post(`/git/assign`, { userId, taskId });
    return res;
  } catch (error) {
    addNotification({
      title: "Error",
      description: "Failed to assign task",
      type: "error",
    });
  }
};

export const openSelectedTaskLink = () => {
  window.open(
    getColumnTasks()[keyboardNavigationStore.selectedTaskIndex].web_url,
    "_blank",
  );
};

export const createMergeRequestAndBranchForSelectedTaskAsync = async () => {
  const columnTasks = getColumnTasks();
  if (columnTasks[keyboardNavigationStore.selectedTaskIndex].type === "issue") {
    const { mergeRequest } = await createMergeRequestAndBranchAsync(
      columnTasks[
        keyboardNavigationStore.selectedTaskIndex
      ].gitlabIid?.toString() || "",
    );

    addNotification({
      title: "Branch and Merge request created",
      description: `Created merge request ${mergeRequest.title}`,
      type: "success",
    });
  } else {
    addNotification({
      title: "Warning",
      description: "Only issues can be converted to merge requests",
      type: "warning",
    });
  }
};

export const loadGitLabProjectsAsync = async () => {
  try {
    const projectsResponse = await axios.get("/git/projects");
    return projectsResponse.data.map((project: Project) => ({
      ...project,
      name: project.name_with_namespace,
    }));
  } catch (error) {
    return [];
  }
};

export const getGitLabUsersAsync = async () => {
  try {
    const usersResponse = await axios.get("/git/users");
    return usersResponse.data;
  } catch (error) {
    return [];
  }
};

export const createMergeRequestAndBranchAsync = async (issueId: string) => {
  const res = await axios.post(`/git/create-merge-request`, { issueId });

  if (res.status !== 200) {
    throw new Error("Failed to create merge request");
  }

  return await res.data;
};
