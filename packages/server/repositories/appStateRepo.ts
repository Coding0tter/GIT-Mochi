import { type IAppStateEntry, AppState } from "../models/appState";
import BaseRepo from "./baseRepo";

export class AppStateRepo extends BaseRepo<IAppStateEntry> {
  constructor() {
    super(AppState);
  }
}
