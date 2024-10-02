import { Project } from "../models/project";
import { SettingRepo } from "../repositories/settingRepo";
import { MochiError } from "../utils/error";
import axios from "axios";

export class ProjectService {
  private settingRepo: SettingRepo;

  constructor() {
    this.settingRepo = new SettingRepo();
  }

  async getCurrentProjectAsync() {
    try {
      const currentProject = await this.settingRepo.getByKeyAsync(
        "currentProject"
      );

      if (currentProject === null) {
        throw new MochiError("No project selected", 404);
      }

      if (currentProject?.value.includes("custom_project")) {
        const project = await Project.findById(
          currentProject.value.split("/")[1]
        );
        return project;
      } else {
        const project = await this.getGitlabProjectAsync(currentProject.value);
        return project;
      }
    } catch (error: any) {
      throw new MochiError(
        `Failed to get current project`,
        500,
        error as Error
      );
    }
  }

  getGitlabProjectAsync = async (projectId: string) => {
    try {
      const projectResponse = await axios.get(
        `${process.env.GIT_API_URL}/projects/${projectId}`,
        {
          headers: { "PRIVATE-TOKEN": process.env.PRIVATE_TOKEN },
        }
      );

      return projectResponse.data;
    } catch (error) {
      throw new MochiError(
        "Failed to get project from gitlab",
        500,
        error as Error
      );
    }
  };

  async createProjectAsync(name: string) {
    try {
      const alreadyExists = await Project.findOne({ name });
      if (alreadyExists) {
        throw new MochiError("Project already exists", 400);
      }

      const project = await Project.create({ name });

      return project;
    } catch (error) {
      throw new MochiError("Failed to create project", 500, error as Error);
    }
  }

  async updateProjectAsync(id: string, name: string) {
    try {
      const updatedProject = await Project.findByIdAndUpdate(
        id,
        { name },
        { new: true }
      );

      if (!updatedProject) {
        throw new MochiError("Project not found", 404);
      }

      return updatedProject;
    } catch (error) {
      throw new MochiError("Failed to update project", 500, error as Error);
    }
  }

  async deleteProjectAsync(id: string) {
    try {
      const deletedProject = await Project.findByIdAndDelete(id);

      if (!deletedProject) {
        throw new MochiError("Project not found", 404);
      }

      return deletedProject;
    } catch (error) {
      throw new MochiError("Failed to delete project", 500, error as Error);
    }
  }

  async getProjectsAsync() {
    try {
      const projects = await Project.find({ deleted: false });
      return projects;
    } catch (error) {
      throw new MochiError("Failed to get projects", 500, error as Error);
    }
  }

  async getProjectByIdAsync(id: string) {
    try {
      const project = await Project.findById(id);
      if (!project) {
        throw new MochiError("Project not found", 404);
      }
      return project;
    } catch (error) {
      throw new MochiError("Failed to get project", 500, error as Error);
    }
  }

  async setCurrentProjectAsync(id: string) {
    try {
      const result = await this.settingRepo.setByKeyAsync("currentProject", id);
      return result;
    } catch (error) {
      throw new MochiError(
        "Failed to set current project",
        500,
        error as Error
      );
    }
  }
}
