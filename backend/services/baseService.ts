import type EventEmitter2 from "eventemitter2";
import type BaseRepo from "../repositories/baseRepo";
import { EventEmitterService } from "../events/eventEmitterService";
import type { Document } from "mongoose";

export abstract class BaseService<T extends Document> {
  protected repository: BaseRepo<T>;
  protected eventEmitter: EventEmitter2;
  protected entityName: string;

  constructor(repository: BaseRepo<T>, entityName: string) {
    this.repository = repository;
    this.entityName = entityName;
    this.eventEmitter = EventEmitterService.getEmitter();
  }

  protected async createAsync(data: Partial<T>): Promise<T> {
    const entity = await this.repository.createAsync(data);
    this.emitEvent("created", entity);
    return entity;
  }

  protected async updateAsync(id: string, data: Partial<T>): Promise<T> {
    const entity = await this.repository.updateAsync(id, data);
    this.emitEvent("updated", entity);
    return entity;
  }

  protected async deleteAsync(id: string): Promise<void> {
    const entity = await this.repository.deleteAsync(id);
    this.emitEvent("deleted", entity);
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

  protected emitEvent(action: string, data: T) {
    const eventType = `${this.entityName}.${action}`;
    this.eventEmitter.emit(eventType, data);
  }
}
