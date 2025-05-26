import type { ISetting } from "@server/models/setting";
import { BaseService } from "./baseService";
import { SettingRepo } from "@server/repositories/settingRepo";
import { SettingKeys } from "shared";
import { MochiError } from "@server/errors/mochiError";
import { GitlabClient } from "@server/gitlab/client";
import { logInfo } from "@server/utils/logger";

export interface GitlabConfig {
  url: string;
  token: string;
}

export interface SetupStatus {
  isComplete: boolean;
  currentStep?: string;
}

export class SettingsService extends BaseService<ISetting> {
  private settingRepo: SettingRepo;
  constructor() {
    const repo = new SettingRepo();
    super(repo, "Setting");
    this.settingRepo = repo;
  }

  async getSetupStatus() {
    try {
      const setupComplete = await this.settingRepo.getByKeyAsync(
        SettingKeys.SETUP_COMPLETE,
      );

      if (setupComplete?.value === "true") {
        return { isComplete: true };
      }

      return {
        isComplete: false,
        currentStep: setupComplete?.value || "welcome",
      };
    } catch (error) {
      throw new MochiError("Failed to get setup status", 500, error as Error);
    }
  }

  async valiateGitlabConnection(config: GitlabConfig) {
    try {
      const testClient = new GitlabClient();
      const user = await testClient.testRequest(config.url, config.token);

      return {
        isValid: true,
        user,
      };
    } catch (error: any) {
      return {
        isValid: false,
        error: error.message || "Failed to connect to GitLab",
      };
    }
  }

  async saveGitlabConfig(config: GitlabConfig) {
    try {
      await this.settingRepo.setByKeyAsync(SettingKeys.GITLAB_URL, config.url);
      await this.settingRepo.setByKeyAsync(
        SettingKeys.PRIVATE_TOKEN,
        config.token,
      );

      logInfo("GitLab config saved successfully");
    } catch (error) {
      throw new MochiError("Failed to save GitLab config", 500, error as Error);
    }
  }

  async completeSetup() {
    try {
      await this.settingRepo.setByKeyAsync(SettingKeys.SETUP_COMPLETE, "true");
    } catch (error) {
      throw new MochiError("Failed to complete setup", 500, error as Error);
    }
  }

  async getGitlabConfig(): Promise<GitlabConfig | null> {
    try {
      const url = await this.settingRepo.getByKeyAsync(SettingKeys.GITLAB_URL);
      const token = await this.settingRepo.getByKeyAsync(
        SettingKeys.PRIVATE_TOKEN,
      );

      if (url && token) {
        return {
          url: url.value,
          token: token.value,
        };
      }
      return null;
    } catch (error) {
      throw new MochiError("Failed to get GitLab config", 500, error as Error);
    }
  }

  async setCurrentProject(projectId: string) {
    try {
      await this.settingRepo.setByKeyAsync(
        SettingKeys.CURRENT_PROJECT,
        projectId,
      );
    } catch (error) {
      throw new MochiError(
        "Failed to set current project",
        500,
        error as Error,
      );
    }
  }

  async getCurrentProject() {
    try {
      const project = await this.settingRepo.getByKeyAsync(
        SettingKeys.CURRENT_PROJECT,
      );

      if (project) {
        return {
          project: project.value,
        };
      }
      return null;
    } catch (error) {
      throw new MochiError(
        "Failed to get current project",
        500,
        error as Error,
      );
    }
  }
}
