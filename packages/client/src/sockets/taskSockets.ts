import {
  updateComments,
  updateTasks,
  updateDiscussions,
} from "@client/stores/taskStore";
import { debounce } from "lodash";
import type { ITask } from "shared/types/task";
import { Socket } from "socket.io-client";

export class TaskSockets {
  private activeCalls: { [key: string]: any[] } = {
    comments: [],
    tasks: [],
    discussions: [],
  };

  public addListeners(io: Socket) {
    io.on("updateComments", (data: { taskId: string; comments: Comment[] }) => {
      this.handleUpdateComments(data);
    });

    io.on(
      "updateDiscussions",
      (data: { taskId: string; discussions: any[] }) => {
        this.handleUpdateDiscussions(data);
      }
    );

    io.on("updateTasks", (data: ITask[]) => {
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

  private handleUpdateDiscussions = (data: {
    taskId: string;
    discussions: any[];
  }) => {
    this.activeCalls["discussions"].push(data);

    this.debouncedUpdate();
  };

  private handleUpdateTasks = (data: ITask[]) => {
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

    if (this.activeCalls["discussions"].length > 0) {
      updateDiscussions(this.activeCalls["discussions"]);
    }

    this.activeCalls["comments"] = [];
    this.activeCalls["tasks"] = [];
    this.activeCalls["discussions"] = [];
  }, 1000);
}
