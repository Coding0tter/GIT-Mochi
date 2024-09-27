import type { Request, Response } from "express";
import {
  syncGitLabData,
  createGitLabMergeRequest,
  getUserByPersonalAccessTokenAsync,
  getProjectsAsync,
  setProjectAsync,
  getProjectAsync,
} from "../services/gitlabService";
import { Setting } from "../models/setting";

// Sync GitLab and RSS data
export const syncGitLab = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    await syncGitLabData();
    res
      .status(200)
      .json({ message: "GitLab data and issues synced successfully" });
  } catch (error) {
    console.error("Error syncing GitLab data:", error);
    res.status(500).json({ error: "Failed to sync data" });
  }
};

// Create a merge request for an issue
export const createMergeRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { issueId } = req.body;
    const result = await createGitLabMergeRequest(issueId);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error creating merge request:", error);
    res.status(500).json({ error: "Failed to create merge request" });
  }
};

export const getUser = async (_req: Request, res: Response): Promise<void> => {
  try {
    const user = await getUserByPersonalAccessTokenAsync();
    res.status(200).json(user);
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
};

export const getProjects = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const projects = await getProjectsAsync();
    res.status(200).json(projects);
  } catch (error) {
    console.error("Error getting projects:", error);
    res.status(500).json({ error: "Failed to get projects" });
  }
};

export const setProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await setProjectAsync(id);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error setting project:", error);
    res.status(500).json({ error: "Failed to set project" });
  }
};

export const getCurrentProject = async (req: Request, res: Response) => {
  try {
    const currentProject = await Setting.findOne({ key: "currentProject" });

    if (!currentProject) {
      res.status(404).json({ error: "No project selected" });
      return;
    }

    const project = await getProjectAsync(currentProject.value);
    res.status(200).json(project);
  } catch (error) {
    console.error("Error getting current project:", error);
    res.status(500).json({ error: "Failed to get current project" });
  }
};
