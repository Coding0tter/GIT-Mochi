import axios from "axios";
import { BACKEND_URL } from "../constants";
import { keyboardNavigationStore } from "../stores/keyboardNavigationStore";
import { fetchTasksAsync, getColumnTasks } from "../stores/taskStore";
import { Project, setLoading } from "../stores/uiStore";
import { addNotification } from "./notificationService";

export const syncGitlabAsync = async () => {
  try {
    setLoading(true);

    const res = await fetch(`${BACKEND_URL}/git/sync`, {
      method: "POST",
    });

    if (!res.ok) {
      throw new Error("Failed to sync with GitLab");
    }
    await fetchTasksAsync();
    setLoading(false);

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
  }
};

export const openSelectedTaskLink = () => {
  window.open(
    getColumnTasks()[keyboardNavigationStore.selectedTaskIndex].web_url,
    "_blank"
  );
};

export const createMergeRequestAndBranchForSelectedTaskAsync = async () => {
  const columnTasks = getColumnTasks();
  if (columnTasks[keyboardNavigationStore.selectedTaskIndex].type === "issue") {
    const { branch, mergeRequest } = await createMergeRequestAndBranchAsync(
      columnTasks[keyboardNavigationStore.selectedTaskIndex].gitlabIid!
    );

    if (branch.error) {
      addNotification({
        title: "Error",
        description: branch.error,
        type: "error",
      });
      return;
    }

    if (mergeRequest.error) {
      addNotification({
        title: "Error",
        description: mergeRequest.error,
        type: "error",
      });
      return;
    }

    addNotification({
      title: "Branch created",
      description: `Created branch ${branch.name}`,
      type: "success",
    });

    addNotification({
      title: "Merge request created",
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
    console.error("Error getting projects:", error);
    return;
  }
};

export const createMergeRequestAndBranchAsync = async (issueId: string) => {
  const res = await fetch(`${BACKEND_URL}/git/create-merge-request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ issueId }),
  });

  if (!res.ok) {
    throw new Error("Failed to create merge request");
  }

  return await res.json();
};
