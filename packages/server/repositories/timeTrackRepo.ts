import { type ITimeTrackEntry, TimeTrack } from "../models/timeTrack";
import BaseRepo from "./baseRepo";

export class TimeTrackRepo extends BaseRepo<ITimeTrackEntry> {
  constructor() {
    super(TimeTrack);
  }
}
