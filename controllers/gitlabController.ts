import type { Request, Response } from "express";
import {
  syncGitLabData,
  createGitLabMergeRequest,
  getUserByPersonalAccessTokenAsync,
  getGitlabProjectsAsync,
} from "../services/gitlabService";
import { logError } from "../utils/logger";

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
    logError("Error syncing GitLab data: " + error);
    res.status(500).json({ error: "Failed to sync data" });
  }
};

export const createMergeRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { issueId } = req.body;
    const result = await createGitLabMergeRequest(issueId);
    res.status(200).json(result);
  } catch (error) {
    logError("Error creating merge request: " + error);
    res.status(500).json({ error: "Failed to create merge request" });
  }
};

export const getUser = async (_req: Request, res: Response): Promise<void> => {
  try {
    const user = await getUserByPersonalAccessTokenAsync();
    res.status(200).json(user);
  } catch (error) {
    logError("Error getting user: " + error);
    res.status(500).json({ error: "Failed to get user" });
  }
};

export const getProjects = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const projects = await getGitlabProjectsAsync();
    res.status(200).json(projects);
  } catch (error) {
    logError("Error getting projects: " + error);
    res.status(500).json({ error: "Failed to get projects" });
  }
};
