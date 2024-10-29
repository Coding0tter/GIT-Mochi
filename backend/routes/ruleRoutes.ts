import express from "express";
import { RuleController } from "../controllers/ruleController";

const router = express.Router();
const ruleController = new RuleController();

router.get("/emitters", ruleController.getEmitters);
router.get("/listeners", ruleController.getListeners);

export default router;
