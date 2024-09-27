import { Accessor } from "solid-js";
import { InputMode, ModalType } from "../App";
import { STATES } from "../constants";
import { addNotification } from "./notificationService";
import {
  createMergeRequestAsync,
  restoreTaskAsync,
  syncGitLabAsync,
  Task,
  updateTaskAsync,
} from "./taskService";

export interface CommandHandlerProps {
  tasks: Accessor<Task[]>;
  selectedColumnIndex: Accessor<number>;
  selectedTaskIndex: Accessor<number>;
  setLoading: (loading: boolean) => void;
  setSelectedColumnIndex: (index: number | ((prev: number) => number)) => void;
  setSelectedTaskIndex: (index: number | ((prev: number) => number)) => void;
  loadTasksAsync: () => Promise<Task[]>;
  setSelectedTaskForDeletion: (task: Task | null) => void;
  setActiveModal: (type: ModalType) => void;
  setSelectedTaskForDetails: (task: Task | null) => void;
  setEditTask: (task: Partial<Task> | null) => void;
  handleCloseModal: () => void;
  toggleShowDeleted: () => void;
  setInputMode: (mode: InputMode) => void;
  searchRef: Accessor<HTMLInputElement | null>;
}

export class CommandHandler {
  private props: CommandHandlerProps;

  constructor(props: CommandHandlerProps) {
    this.props = props;
  }

  public closeModalAndUnfocus() {
    this.props.handleCloseModal();
    this.props.setInputMode(InputMode.None);
    setTimeout(() => {
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement) {
        activeElement.blur();
      }
    });
  }

  public openCommandline() {
    this.props.setInputMode(InputMode.Commandline);
    if (this.props.searchRef) {
      setTimeout(() => this.props.searchRef()!.focus(), 0);
    }
  }

  public openSearch() {
    this.props.setInputMode(InputMode.Search);
    if (this.props.searchRef) {
      setTimeout(() => this.props.searchRef()!.focus(), 0);
    }
  }

  public async moveSelection(direction: "up" | "down" | "left" | "right") {
    const columnTasks = this._getColumnTasks();
    switch (direction) {
      case "up":
        this.props.setSelectedTaskIndex(
          (prev) => (prev - 1 + columnTasks.length) % columnTasks.length
        );
        break;
      case "down":
        this.props.setSelectedTaskIndex(
          (prev) => (prev + 1) % columnTasks.length
        );
        break;
      case "left":
        this.props.setSelectedColumnIndex(
          (prev) => (prev - 1 + STATES.length) % STATES.length
        );
        this.props.setSelectedTaskIndex(0);
        break;
      case "right":
        this.props.setSelectedColumnIndex((prev) => (prev + 1) % STATES.length);
        this.props.setSelectedTaskIndex(0);
        break;
    }
  }

  public openHelp() {
    this.props.setActiveModal(ModalType.Help);
  }

  public openDelete() {
    this.props.setActiveModal(ModalType.DeleteTask);
    this.props.setSelectedTaskForDeletion(
      this._getColumnTasks()[this.props.selectedTaskIndex()]
    );
  }

  public openCreate() {
    this.props.setActiveModal(ModalType.CreateTask);
    this.props.setEditTask({
      title: "",
      description: "",
      status: STATES.at(0)!.id,
    });
  }

  public openEdit() {
    this.props.setActiveModal(ModalType.CreateTask);
    this.props.setEditTask(
      this._getColumnTasks()[this.props.selectedTaskIndex()]
    );
  }

  public openDetails() {
    this.props.setSelectedTaskForDetails(
      this._getColumnTasks()[this.props.selectedTaskIndex()]
    );
    this.props.setActiveModal(ModalType.TaskDetails);
  }

  public toggleShowDeleted() {
    this.props.toggleShowDeleted();
  }

  public async moveTaskAsync(direction: "next" | "previous") {
    const columnTasks = this._getColumnTasks();
    const newStatusIndex =
      direction === "next"
        ? Math.min(this.props.selectedColumnIndex() + 1, STATES.length - 1)
        : Math.max(this.props.selectedColumnIndex() - 1, 0);

    const taskToMove = columnTasks[this.props.selectedTaskIndex()];
    if (
      (
        await updateTaskAsync(taskToMove._id, {
          status: STATES[newStatusIndex].id,
        })
      )?.ok
    ) {
      const result = await this.props.loadTasksAsync();

      const newColumnTasks = result.filter(
        (task) => task.status === STATES[newStatusIndex].id
      );
      const movedTaskIndex = newColumnTasks.findIndex(
        (task) => task._id === taskToMove._id
      );

      this.props.setSelectedColumnIndex(newStatusIndex);
      this.props.setSelectedTaskIndex(movedTaskIndex);
    }
  }

  public async syncGitlab() {
    try {
      this.props.setLoading(true);
      if (!(await syncGitLabAsync())) {
        throw new Error("Failed to sync with GitLab");
      }
      await this.props.loadTasksAsync();
      this.props.setLoading(false);

      addNotification({
        title: "Synced with GitLab",
        description: "Tasks have been synced with GitLab",
        type: "success",
      });
    } catch (error) {
      addNotification({
        title: "Error",
        description: "Failed to sync with GitLab",
        type: "error",
      });
    }
  }

  public openLink() {
    window.open(
      this._getColumnTasks()[this.props.selectedTaskIndex()].web_url,
      "_blank"
    );
  }

  public async createMergeRequestForSelectedAsync() {
    const columnTasks = this._getColumnTasks();
    if (columnTasks[this.props.selectedTaskIndex()].type === "issue") {
      await this.createMergeRequestAsync(
        columnTasks[this.props.selectedTaskIndex()].gitlabIid!
      );
    } else {
      addNotification({
        title: "Warning",
        description: "Only issues can be converted to merge requests",
        type: "warning",
      });
    }
  }

  public async createMergeRequestAsync(iid: string) {
    const { branch, mergeRequest } = await createMergeRequestAsync(iid);

    if (branch.error) {
      addNotification({
        title: "Error",
        description: branch.error,
        type: "error",
      });
      return;
    }

    if (mergeRequest.error) {
      addNotification({
        title: "Error",
        description: mergeRequest.error,
        type: "error",
      });
      return;
    }

    addNotification({
      title: "Branch created",
      description: `Created branch ${branch.name}`,
      type: "success",
    });

    addNotification({
      title: "Merge request created",
      description: `Created merge request ${mergeRequest.title}`,
      type: "success",
    });
  }

  public async restoreTaskAsync() {
    try {
      await restoreTaskAsync(
        this._getColumnTasks()[this.props.selectedTaskIndex()]._id
      );
      await this.props.loadTasksAsync();

      addNotification({
        title: "Task restored",
        description: "Task has been restored",
        type: "success",
      });
    } catch (error) {
      addNotification({
        title: "Error",
        description: "Failed to restore task",
        type: "error",
      });
    }
  }

  private _getColumnTasks() {
    return this.props
      .tasks()
      .filter(
        (task) => task.status === STATES[this.props.selectedColumnIndex()].id
      );
  }
}
