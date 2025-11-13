import { SettingRepo } from "@server/repositories/setting.repo.ts";
import type { ObjectId } from "mongoose";
import { SettingKeys } from "shared";

export class SettingService {
  constructor(private readonly _repo = new SettingRepo()) {}

  async getSettingByKey<T = unknown>(
    key: SettingKeys | string,
  ): Promise<T | null> {
    const setting = await this._repo.getByKeyAsync(key);
    if (!setting) return null;

    try {
      return JSON.parse(setting.value) as T;
    } catch (err) {
      return setting.value as unknown as T;
    }
  }

  async setSettingByKey<T>(key: SettingKeys | string, value: T): Promise<void> {
    const serialized = JSON.stringify(value);
    await this._repo.setByKeyAsync(key, serialized);
  }

  async getUserSettingByKey<T = unknown>(
    userId: ObjectId,
    key: SettingKeys | string,
  ): Promise<T | null> {
    const setting = await this._repo.getByUserAndKeyAsync(userId, key);
    if (!setting) return null;

    try {
      return JSON.parse(setting.value) as T;
    } catch (err) {
      return setting.value as unknown as T;
    }
  }

  async setUserSettingByKey<T>(
    userId: ObjectId,
    key: SettingKeys | string,
    value: T,
  ): Promise<void> {
    const serialized = JSON.stringify(value);
    await this._repo.setByUserAndKeyAsync(userId, key, serialized);
  }
}
