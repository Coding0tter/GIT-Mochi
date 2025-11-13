import { SettingController } from "@server/controllers/setting.controller.v2.ts";
import express from "express";

const router = express.Router();
const settingController = new SettingController();

router.get("/user/:key", settingController.getUserSettingByKey);
router.put("/user/:key", settingController.setUserSettingByKey);
router.get("/:key", settingController.getSettingByKey);
router.put("/:key", settingController.setSettingByKey);

export default router;
