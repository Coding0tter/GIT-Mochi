import { AppStateKey } from "../models/appState";
import type { ITimeTrackEntry } from "../models/timeTrack";
import { TimeTrackRepo } from "../repositories/timeTrackRepo";
import { MochiResult } from "../utils/mochiResult";
import { AppStateService } from "./appStateService";
import { BaseService } from "./baseService";

class TimeTrackService extends BaseService<ITimeTrackEntry> {
  private appStateService: AppStateService;

  constructor() {
    super(new TimeTrackRepo(), "TimeTrack");

    this.appStateService = new AppStateService();
  }

  public async updateTimeTrackEntryAsync(id: string, entry: ITimeTrackEntry) {
    try {
      return await super.updateAsync(id, entry);
    } catch (error: any) {
      return new MochiResult(null, error);
    }
  }

  public async toggleRecordingAsync() {
    const isRecording = await this.appStateService.getAppState(
      AppStateKey.Recording
    );

    if (isRecording?.value === undefined || isRecording.value === "false") {
      await this.appStateService.setAppState(AppStateKey.Recording, "true");

      await this.createAsync({
        start: new Date(),
      });

      return true;
    } else {
      await this.appStateService.setAppState(AppStateKey.Recording, "false");

      const currentEntry = await this.repository.findOneAsync({
        end: undefined,
      });

      if (currentEntry) {
        await this.updateAsync(currentEntry._id as string, {
          end: new Date(),
        });
      }

      return false;
    }
  }

  public async getRecordingStateAsync(): Promise<boolean> {
    const isRecording = await this.appStateService.getAppState(
      AppStateKey.Recording
    );
    return isRecording?.value === "true";
  }

  public async getTimetrackEntriesAsync(): Promise<ITimeTrackEntry[]> {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const endOfWeek = new Date();
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return this.repository.getAllAsync({
      start: { $gte: startOfWeek, $lt: endOfWeek },
    });
  }
}

export default TimeTrackService;
