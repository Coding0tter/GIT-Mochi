import { Project, type IProject } from "../models/project";
import { MochiError } from "../errors/mochiError";
import axios from "axios";
import { BaseService } from "./baseService";
import { ProjectRepo } from "../repositories/projectRepo";
import { SettingRepo } from "../repositories/settingRepo";

export class ProjectService extends BaseService<IProject> {
  private settingRepo = new SettingRepo();

  constructor() {
    super(new ProjectRepo(), "Project");
  }

  async getCurrentProjectAsync() {
    console.trace("getcurrentproject");
    try {
      const currentProject =
        await this.settingRepo.getByKeyAsync("currentProject");

      if (currentProject === null) {
        throw new MochiError("No project selected", 404);
      }

      if (currentProject?.value.includes("custom_project")) {
        const project = await Project.findById(
          currentProject.value.split("/")[1],
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
        error as Error,
      );
    }
  }

  getGitlabProjectAsync = async (projectId: string) => {
    try {
      const projectResponse = await axios.get(
        `${process.env.GIT_URL}/api/v4/projects/${projectId}`,
        {
          headers: { "PRIVATE-TOKEN": process.env.PRIVATE_TOKEN },
        },
      );

      return projectResponse.data;
    } catch (error) {
      throw new MochiError(
        "Failed to get project from gitlab",
        500,
        error as Error,
      );
    }
  };

  async createProjectAsync(name: string) {
    const alreadyExists = await Project.findOne({ name });
    if (alreadyExists) {
      throw new MochiError("Project already exists", 400);
    }

    const project = await super.createAsync({ name });

    return project;
  }

  async updateProjectAsync(id: string, name: string) {
    const updatedProject = await super.updateAsync(id, { name });

    if (!updatedProject) {
      throw new MochiError("Project not found", 404);
    }

    return updatedProject;
  }

  async deleteProjectAsync(id: string) {
    const deletedProject = await super.deleteAsync(id);

    return deletedProject;
  }

  async getProjectsAsync() {
    return await super.getAllAsync({ deleted: false });
  }

  async getProjectByIdAsync(id: string) {
    const project = await super.getByIdAsync(id);

    if (!project) {
      throw new MochiError("Project not found", 404);
    }

    return project;
  }

  async setCurrentProjectAsync(id: string) {
    try {
      const result = await this.settingRepo.setByKeyAsync("currentProject", id);
      return result;
    } catch (error) {
      throw new MochiError(
        "Failed to set current project",
        500,
        error as Error,
      );
    }
  }
}
