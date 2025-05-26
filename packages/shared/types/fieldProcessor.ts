import type { ITask } from "./task";

export interface FieldProcessor {
  fieldName: string;
  process(entity: any, task: Partial<ITask>, projectId: string): Promise<void>;
  shouldProcess(entity: any): boolean;
}
