import { addNotification } from "@client/services/notificationService";
import type { Project } from "@client/stores/uiStore";
import axios, { AxiosError } from "axios";

export const createProjectAsync = async (name: string) => {
  try {
    const response = await axios.post("/projects", { name });
    if (response.status === 200) {
      addNotification({
        title: "Project created",
        description: `Project ${name} has been created`,
        type: "success",
      });
    }

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError)
      addNotification({
        title: "Error",
        description: error.message,
        type: "error",
      });
  }
};

export const deleteProjectAsync = async (projectId: string) => {
  try {
    const response = await axios.delete(`/projects/${projectId}`);
    if (response.status === 200) {
      addNotification({
        title: "Project deleted",
        description: `Project has been deleted`,
        type: "success",
      });
    }
  } catch (error) {
    if (error instanceof AxiosError)
      addNotification({
        title: "Error",
        description: error.message,
        type: "error",
      });
  }
};

export const loadCustomProjectsAsync = async () => {
  try {
    const response = await axios.get("/projects");
    return response.data.map((project: Project) => ({
      ...project,
      custom: true,
      id: project._id,
    }));
  } catch (error) {
    if (error instanceof AxiosError)
      addNotification({
        title: "Error",
        description: error.message,
        type: "error",
      });
    return [];
  }
};

export const setProjectAsync = async (projectId: string) => {
  try {
    const response = await axios.patch("/projects", { projectId });
    return response;
  } catch (error) {
    return;
  }
};

export const getProjectAsync = async () => {
  try {
    const response = await axios.get("/projects/current");
    return {
      ...response.data,
      name: response.data?.name_with_namespace || response.data?.name,
    };
  } catch (error) {
    return null;
  }
};
