import { SettingsController } from "@server/controllers/settings.controller";
import { SettingRepo } from "@server/repositories/setting.repo";
import express from "express";
import { SettingKeys } from "shared";

const router = express.Router();
const settingsRepo = new SettingRepo();
const controller = new SettingsController();

router.get("/lastSync", async (req, res) => {
  res.send(
    (await settingsRepo.getByKeyAsync(SettingKeys.LAST_SYNC))?.value ?? null,
  );
});

router.get("/setup-status", controller.getSetupStatus);
router.get("/gitlab-url", controller.getGitlabUrl);
router.post("/validate-gitlab", controller.validateGitlabConnection);
router.post("/gitlab-config", controller.saveGitlabConfig);
router.post("/complete-setup", controller.completeSetup);

export default router;
