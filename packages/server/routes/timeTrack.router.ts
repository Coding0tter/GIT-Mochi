import express from "express";
import { TimeTrackController } from "../controllers/timeTrack.controller";

const router = express.Router();
const timeTrackController = new TimeTrackController();

router.get("/", timeTrackController.getTimeTrackEntriesAsync);
router.get("/recording", timeTrackController.getRecordingStateAsync);
router.put("/recording", timeTrackController.toggleRecordingAsync);
router.put("/:id", timeTrackController.updateTimeTrackEntryAsync);

export default router;
