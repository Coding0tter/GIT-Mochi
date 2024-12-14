import express from "express";
import { TimeTrackController } from "../controllers/timeTrackController";

const router = express.Router();
const timeTrackController = new TimeTrackController();

router.get("/", timeTrackController.getTimeTrackEntriesAsync);
router.get("/recording", timeTrackController.getRecoringStateAsync);
router.put("/recording", timeTrackController.toggleRecordingAsync);
router.put("/:id", timeTrackController.updateTimeTrackEntryAsync);

export default router;
