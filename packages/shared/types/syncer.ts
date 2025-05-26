import type { ITask } from "./task";

export interface Syncer {
  name: string;
  sync(fullSync?: boolean): Promise<ITask[]>;
}
