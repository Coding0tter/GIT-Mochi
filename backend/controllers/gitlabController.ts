import type { NextFunction, Request, Response } from "express";
import {
  createGitLabMergeRequest,
  getUserByPersonalAccessTokenAsync,
  getGitlabProjectsAsync,
  GitlabService,
} from "../services/gitlabService";
import { handleControllerError } from "../utils/error";

export class GitlabController {
  private gitlabService: GitlabService;

  constructor() {
    this.gitlabService = new GitlabService();
  }

  syncGitLabAsync = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await this.gitlabService.syncGitLabData();
      res
        .status(200)
        .json({ message: "GitLab data and issues synced successfully" });
    } catch (error) {
      handleControllerError(error, next);
    }
  };

  createMergeRequestAsync = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { issueId } = req.body;
      const result = await createGitLabMergeRequest(issueId);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to create merge request" });
    }
  };
}

export const createMergeRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { issueId } = req.body;
    const result = await createGitLabMergeRequest(issueId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to create merge request" });
  }
};

export const getUser = async (_req: Request, res: Response): Promise<void> => {
  try {
    const user = await getUserByPersonalAccessTokenAsync();
    res.status(200).json(user);
  } catch (error) {
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
    res.status(500).json({ error: "Failed to get projects" });
  }
};
