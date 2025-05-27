import axios from "axios";
import { SettingKeys } from "shared";
import { MochiError } from "../errors/mochi.error";
import { Project, type IProject } from "../models/project.model";
import { ProjectRepo } from "../repositories/project.repo";
import { BaseService } from "./base.service";
import { SettingsService } from "./settings.service";
import { logInfo } from "@server/utils/logger";

export class ProjectService extends BaseService<IProject> {
  private settingsService = new SettingsService();
  constructor() {
    super(new ProjectRepo(), "Project");
  }

  async getCurrentProjectAsync() {
    try {
      const config = await this.settingsService.getCurrentProject();

      if (config === null) {
        logInfo("No project selected, returning null");
        return null;
      }

      if (config.project?.includes("custom_project")) {
        const project = await Project.findById(config.project.split("/")[1]);
        return project;
      } else {
        const project = await this.getGitlabProjectAsync(config.project);
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
      const config = await this.settingsService.getGitlabConfig();
      if (!config) throw new MochiError("GitLab configuration not found", 404);

      const projectResponse = await axios.get(
        `${config.url}/api/v4/projects/${projectId}`,
        {
          headers: { "PRIVATE-TOKEN": config.token },
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
      const result = await this.settingsService.setCurrentProject(id);
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
