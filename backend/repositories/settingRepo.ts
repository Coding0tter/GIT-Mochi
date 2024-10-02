import BaseRepo from "./baseRepo";
import { Setting, type ISetting } from "../models/setting.js";
import { MochiError } from "../utils/error.js";

export class SettingRepo extends BaseRepo<ISetting> {
  constructor() {
    super(Setting);
  }

  async getByKeyAsync(key: string): Promise<ISetting | null> {
    try {
      return this.model.findOne({ key });
    } catch (error) {
      throw new MochiError(
        `Failed to get setting by key ${key}`,
        500,
        error as Error
      );
    }
  }

  async setByKeyAsync(key: string, value: string): Promise<ISetting> {
    try {
      const setting = this.model.findOneAndUpdate(
        { key },
        { value },
        { new: true }
      );

      if (!setting) {
        return this.model.create({ key, value });
      }

      return setting;
    } catch (error) {
      throw new MochiError(
        `Failed to set setting by key ${key}`,
        500,
        error as Error
      );
    }
  }
}
