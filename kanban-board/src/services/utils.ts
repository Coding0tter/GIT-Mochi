import { BACKEND_URL } from "../constants";

export interface Comment {
  id: number;
  body: string;
  resolved: boolean;
  author: {
    name: string;
    username: string;
  };
  system: boolean;
}

export const getUser = async () => {
  try {
    const userResponse = await fetch(`${BACKEND_URL}/git/user`);
    return userResponse.json();
  } catch (error) {
    console.error("Error getting user:", error);
    return;
  }
};

export const loadProjectsAsync = async () => {
  try {
    const projectsResponse = await fetch(`${BACKEND_URL}/git/projects`);
    return projectsResponse.json();
  } catch (error) {
    console.error("Error getting projects:", error);
    return;
  }
};

export const setProject = async (projectId: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/git/project/${projectId}`, {
      method: "PATCH",
    });
    return response.json();
  } catch (error) {
    console.error("Error setting project:", error);
    return;
  }
};

export const getProject = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/git/project`);
    return response.json();
  } catch (error) {
    console.error("Error getting project:", error);
  }
};
