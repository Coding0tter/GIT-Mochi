import { handleControllerError } from "@server/errors/mochi.error";
import { SettingsService } from "@server/services/settings.service";
import type { NextFunction, Request, Response } from "express";

export class SettingsController {
  private service = new SettingsService();

  getSetupStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const status = await this.service.getSetupStatus();
      res.status(200).json(status);
    } catch (error) {
      handleControllerError(error, next);
    }
  };

  validateGitlabConnection = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { url, token } = req.body;

      if (!url || !token) {
        res.status(400).json({
          error: "URL and token are required for validation",
        });
        return;
      }

      const result = await this.service.validateGitlabConnection({
        url,
        token,
      });

      res.status(200).json(result);
    } catch (error) {
      handleControllerError(error, next);
    }
  };

  saveGitlabConfig = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { url, token } = req.body;

      if (!url || !token) {
        res.status(400).json({
          error: "URL and token are required to save GitLab configuration",
        });
        return;
      }

      await this.service.saveGitlabConfig({ url, token });
      res
        .status(200)
        .json({ message: "GitLab configuration saved successfully" });
    } catch (error) {
      handleControllerError(error, next);
    }
  };

  completeSetup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.completeSetup();
      res.status(200).json({ message: "Setup completed successfully" });
    } catch (error) {
      handleControllerError(error, next);
    }
  };
}
