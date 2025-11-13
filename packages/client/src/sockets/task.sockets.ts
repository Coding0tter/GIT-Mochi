import { updateTasks } from "@client/features/kanban/stores/kanban.store.ts";
import { type ITaskV2 } from "shared/types/";
import type { Socket } from "socket.io-client";

export class TaskV2Sockets {
  public addListeners(io: Socket) {
    io.on("tasks.changed", (data: ITaskV2[]) => {
      updateTasks(data);
    });
  }
}
