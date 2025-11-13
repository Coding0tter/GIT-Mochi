import { SettingRepo } from "@server/repositories/setting.repo.ts";
import axios from "axios";
import { Router } from "express";
import { SettingKeys } from "shared";

const router = Router();

router.get("", (req, res) => {
  console.log("Safe route accessed");
  res.json({ test: "Safe route is working" });
});

router.get("/user", async (req, res) => {
  try {
    const gitlabToken = req.user.gitlabToken;

    const settingsRepo = new SettingRepo();

    const git_url = (await settingsRepo.getByKeyAsync(SettingKeys.GITLAB_URL))
      ?.value;

    const response = await axios.get(`${git_url}/api/v4/user`, {
      headers: {
        Authorization: `Bearer ${gitlabToken.access_token}`,
        "Content-Type": "application/json",
      },
    });

    res.json(response.data);
  } catch (error) {
    res.sendStatus(500);
  }
});

export default router;
