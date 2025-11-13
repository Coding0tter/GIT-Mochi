import BaseRepo from "./base.repo.js";
import { Setting, type ISetting } from "../models/setting.model.js";
import { MochiError } from "../errors/mochi.error.js";
import type { ObjectId } from "mongoose";
import { User } from "@server/models/user.model.js";

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
        error as Error,
      );
    }
  }

  async setByKeyAsync(key: string, value: string): Promise<ISetting> {
    try {
      const setting = await this.model.findOneAndUpdate(
        { key },
        { value },
        { new: true },
      );

      if (!setting) {
        return super.createAsync({ key, value });
      }

      return setting;
    } catch (error) {
      throw new MochiError(
        `Failed to set setting by key ${key}`,
        500,
        error as Error,
      );
    }
  }

  async getByUserAndKeyAsync(
    userId: ObjectId,
    key: string,
  ): Promise<ISetting | null> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new MochiError(`User with id ${userId} not found`, 404);
      }

      return user.settings.find((setting) => setting.key === key) || null;
    } catch (error) {
      throw new MochiError(
        `Failed to get setting by user ${userId} and key ${key}`,
        500,
        error as Error,
      );
    }
  }

  async setByUserAndKeyAsync(
    userId: ObjectId,
    key: string,
    value: string,
  ): Promise<ISetting> {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new MochiError(`User with id ${userId} not found`, 404);
      }

      user.settings = user.settings || [];

      const existingSettingIndex = user.settings.findIndex(
        (setting) => setting.key === key,
      );

      if (existingSettingIndex !== -1) {
        user.settings[existingSettingIndex].value = value;
      } else {
        user.settings.push({ key, value } as ISetting);
      }
      await user.save();

      const updatedSetting = user.settings.find(
        (setting) => setting.key === key,
      ) as ISetting;

      return updatedSetting;
    } catch (error) {
      throw new MochiError(
        `Failed to set setting by user ${userId} and key ${key}`,
        500,
        error as Error,
      );
    }
  }
}
