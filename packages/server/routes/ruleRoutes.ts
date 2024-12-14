import express from "express";
import { RuleController } from "../controllers/ruleController";

const router = express.Router();
const ruleController = new RuleController();

router.get("/emitters", ruleController.getEmittersAsync);
router.get("/listeners", ruleController.getListenersAsync);
router.post("/", ruleController.createRuleAsync);
router.get("/", ruleController.getAllRulesAsync);
router.delete("/:id", ruleController.deleteRuleAsync);
router.put("/toggle/:id", ruleController.toggleRuleAsync);

export default router;
