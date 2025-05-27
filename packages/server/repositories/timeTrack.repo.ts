import { type ITimeTrackEntry, TimeTrack } from "../models/timeTrack.model";
import BaseRepo from "./base.repo";

export class TimeTrackRepo extends BaseRepo<ITimeTrackEntry> {
  constructor() {
    super(TimeTrack);
  }
}
