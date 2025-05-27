import { type IAppStateEntry, AppState } from "../models/appState.model";
import BaseRepo from "./base.repo";

export class AppStateRepo extends BaseRepo<IAppStateEntry> {
  constructor() {
    super(AppState);
  }
}
