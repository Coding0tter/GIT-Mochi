import { Socket } from "socket.io-client";
import { Task, updateComments, updateTasks } from "../stores/taskStore";
import { debounce } from "lodash";

export class TaskSockets {
  private activeCalls: { [key: string]: any[] } = {
    comments: [],
    tasks: [],
  };

  public addListeners(io: Socket) {
    io.on("updateComments", (data: { taskId: string; comments: Comment[] }) => {
      this.handleUpdateComments(data);
    });

    io.on("updateTasks", (data: Task[]) => {
      this.handleUpdateTasks(data);
    });
  }

  private handleUpdateComments = (data: {
    taskId: string;
    comments: Comment[];
  }) => {
    this.activeCalls["comments"].push(data);

    this.debouncedUpdate();
  };

  private handleUpdateTasks = (data: Task[]) => {
    this.activeCalls["tasks"].push(...data);

    this.debouncedUpdate();
  };

  private debouncedUpdate = debounce(() => {
    if (this.activeCalls["comments"].length > 0) {
      updateComments(this.activeCalls["comments"]);
    }

    if (this.activeCalls["tasks"].length > 0) {
      updateTasks(this.activeCalls["tasks"]);
    }

    this.activeCalls["comments"] = [];
    this.activeCalls["tasks"] = [];
  }, 1000);
}
