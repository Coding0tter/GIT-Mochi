import axios from "axios";
import { addNotification } from "./notificationService";

export interface SetupStatus {
  isComplete: boolean;
  currentStep?: string;
}

export interface GitlabValidationResult {
  isValid: boolean;
  user?: any;
  error?: string;
}

class SettingsService {
  async getSetupStatus(): Promise<SetupStatus> {
    try {
      const response = await axios.get("/settings/setup-status");
      return response.data;
    } catch (error) {
      return { isComplete: false };
    }
  }

  async validateGitLabConnection(
    url: string,
    token: string,
  ): Promise<GitlabValidationResult> {
    try {
      const response = await axios.post("/settings/validate-gitlab", {
        url,
        token,
      });
      return response.data;
    } catch (error) {
      return {
        isValid: false,
        error: "Failed to validate connection",
      };
    }
  }

  async saveGitLabConfig(url: string, token: string): Promise<void> {
    try {
      await axios.post("/settings/gitlab-config", { url, token });
    } catch (error) {
      throw new Error("Failed to save GitLab configuration");
    }
  }

  async completeSetup(): Promise<void> {
    try {
      await axios.post("/settings/complete-setup");
    } catch (error) {
      throw new Error("Failed to complete setup");
    }
  }

  async updateSetting(key: string, value: any): Promise<void> {
    try {
      await axios.put(`/settings/${key}`, { value });
      addNotification({
        title: "Success",
        description: "Setting updated successfully",
        type: "success",
      });
    } catch (error) {
      addNotification({
        title: "Error",
        description: "Failed to update setting",
        type: "error",
      });
      throw error;
    }
  }
}

export const settingsService = new SettingsService();
