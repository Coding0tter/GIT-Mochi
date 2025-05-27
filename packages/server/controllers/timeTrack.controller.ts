import { handleControllerError } from "../errors/mochi.error";
import TimeTrackService from "../services/timeTrack.service";
import type { Request, Response, NextFunction } from "express";

export class TimeTrackController {
  private timeTrackService: TimeTrackService;

  constructor() {
    this.timeTrackService = new TimeTrackService();
  }

  getTimeTrackEntriesAsync = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const entries = await this.timeTrackService.getTimetrackEntriesAsync();
      res.status(200).json(entries);
    } catch (error) {
      handleControllerError(error, next);
    }
  };

  updateTimeTrackEntryAsync = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id, entry } = req.body;
      const result = await this.timeTrackService.updateTimeTrackEntryAsync(
        id,
        entry,
      );
      res.status(200).json(result);
    } catch (error) {
      handleControllerError(error, next);
    }
  };

  getRecoringStateAsync = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const recording = await this.timeTrackService.getRecordingStateAsync();
      res.status(200).json(recording);
    } catch (error) {
      handleControllerError(error, next);
    }
  };

  toggleRecordingAsync = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const state = await this.timeTrackService.toggleRecordingAsync();
      res.status(200).send(state);
    } catch (error) {
      handleControllerError(error, next);
    }
  };
}
