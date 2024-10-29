import type EventEmitter2 from "eventemitter2";
import type BaseRepo from "../repositories/baseRepo";
import type { Document } from "mongoose";

export abstract class BaseService<T extends Document> {
  protected repository: BaseRepo<T>;
  protected entityName: string;

  constructor(repository: BaseRepo<T>, entityName: string) {
    this.repository = repository;
    this.entityName = entityName;
  }

  protected async createAsync(data: Partial<T>): Promise<T> {
    const entity = await this.repository.createAsync(data);

    return entity;
  }

  protected async updateAsync(id: string, data: Partial<T>): Promise<T> {
    const entity = await this.repository.updateAsync(id, data);

    return entity;
  }

  protected async deleteAsync(id: string): Promise<void> {
    await this.repository.deleteAsync(id);
  }

  async getByIdAsync(id: string): Promise<T> {
    return await this.repository.getByIdAsync(id);
  }

  async findOneAsync(filter: Record<string, unknown>): Promise<T> {
    return await this.repository.findOneAsync(filter);
  }

  async getAllAsync(filter?: Record<string, unknown> | null): Promise<T[]> {
    return await this.repository.getAllAsync(filter);
  }
}
