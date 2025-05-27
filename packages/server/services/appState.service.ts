import type { IAppStateEntry } from "../models/appState.model";
import { AppStateRepo } from "../repositories/appState.repo";

export class AppStateService {
  private appStateRepo: AppStateRepo;

  constructor() {
    this.appStateRepo = new AppStateRepo();
  }

  async getAppState(key: string): Promise<IAppStateEntry | null> {
    return this.appStateRepo.findOneAsync({ key });
  }

  async setAppState(key: string, value: string): Promise<IAppStateEntry> {
    const existing = await this.appStateRepo.findOneAsync({ key });
    if (existing) {
      return this.appStateRepo.updateAsync(existing._id as string, { value });
    } else {
      return this.appStateRepo.createAsync({ key, value });
    }
  }
}
