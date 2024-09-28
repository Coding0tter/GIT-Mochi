import { Project } from "../models/project";
import type { Request, Response } from "express";
import { Setting } from "../models/setting";

export const createProjectAsync = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name } = req.body;
    const project = await Project.create({ name });
    res.status(200).json(project);
  } catch (error) {
    console.error("Error creating project:", error);
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
    console.error("Error updating project:", error);
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
    console.error("Error deleting project:", error);
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
    console.error("Error getting projects:", error);
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
    console.error("Error getting project:", error);
    res.status(500).json({ error: "Failed to get project" });
  }
};

export const setCurrentProjectAsync = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const currentProject = await Setting.findOne({ key: "currentProject" });

    if (currentProject) {
      await Setting.findByIdAndUpdate(currentProject._id, {
        value: `custom_${id}`,
      });
    } else {
      await Setting.create({ key: "currentProject", value: `custom_${id}` });
    }

    res.status(200).json({ message: "Current project set" });
  } catch (error) {
    console.error("Error setting current project:", error);
    res.status(500).json({ error: "Failed to set current project" });
  }
};
