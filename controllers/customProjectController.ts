import { Project } from "../models/project";
import type { Request, Response } from "express";
import { Setting } from "../models/setting";
import { getGitlabProjectAsync } from "../services/gitlabService";
import { logError, logInfo } from "../utils/logger";

export const createProjectAsync = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name } = req.body;
    const project = await Project.create({ name });
    res.status(200).json(project);
  } catch (error) {
    logError("Error creating project: " + error);
    res.status(500).json({ error: "Failed to create project" });
  }
};

export const updateProjectAsync = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const project = await Project.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    );
    res.status(200).json(project);
  } catch (error) {
    logError("Error updating project: " + error);
    res.status(500).json({ error: "Failed to update project" });
  }
};

export const deleteProjectAsync = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    await Project.findByIdAndUpdate(id, { deleted: true });
    res.status(200).json({ message: "Project deleted" });
  } catch (error) {
    logError("Error deleting project: " + error);
    res.status(500).json({ error: "Failed to delete project" });
  }
};

export const getProjectsAsync = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const projects = await Project.find({ deleted: false });
    res.status(200).json(projects);
  } catch (error) {
    logError("Error getting projects: " + error);
    res.status(500).json({ error: "Failed to get projects" });
  }
};

export const getProjectAsync = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);
    res.status(200).json(project);
  } catch (error) {
    logError("Error getting project: " + error);
    res.status(500).json({ error: "Failed to get project" });
  }
};

export const setCurrentProjectAsync = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { projectId } = req.body;
    const currentProject = await Setting.findOne({ key: "currentProject" });

    if (currentProject) {
      await Setting.findByIdAndUpdate(currentProject._id, {
        value: projectId,
      });
    } else {
      await Setting.create({ key: "currentProject", value: projectId });
    }
    res.status(200).json(projectId);
  } catch (error) {
    logError("Error setting project: " + error);
    res.status(500).json({ error: "Failed to set project" });
  }
};

export const getCurrentProjectAsync = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const currentProject = await Setting.findOne({ key: "currentProject" });

    if (!currentProject) {
      res.status(200).json(null);
      return;
    }

    if (currentProject?.value.includes("custom_project")) {
      const project = await Project.findById(
        currentProject.value.split("/")[1]
      );
      res.status(200).json(project);
    } else {
      const project = await getGitlabProjectAsync(currentProject.value);
      res.status(200).json(project);
    }
  } catch (error) {
    logError("Error getting current project: " + error);
    res.status(500).json({ error: "Failed to get current project" });
  }
};
