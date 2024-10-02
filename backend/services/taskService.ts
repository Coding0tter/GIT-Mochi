import type { ITask } from "../models/task";
import { TaskRepo } from "../repositories/taskRepo";
import { MochiError } from "../utils/error";
import { ProjectService } from "./projectService";

export class TaskService {
  private taskRepo: TaskRepo;
  private projectService: ProjectService;

  constructor() {
    this.taskRepo = new TaskRepo();
    this.projectService = new ProjectService();
  }

  async createTaskAsync(task: Partial<ITask>) {
    try {
      const currentProject = await this.projectService.getCurrentProjectAsync();

      if (!currentProject) {
        throw new MochiError("No project selected", 404);
      }

      task.projectId = currentProject.id;

      return this.taskRepo.createAsync(task as ITask);
    } catch (error: any) {
      throw new MochiError("Failed to create task", 500, error as Error);
    }
  }

  async getTasksAsync(showDeleted: boolean) {
    try {
      const currentProject = await this.projectService.getCurrentProjectAsync();

      if (!currentProject) {
        throw new MochiError("No project selected", 404);
      }

      const tasks = await this.taskRepo.getAllAsync({
        projectId: currentProject.id,
      });
      return showDeleted ? tasks : tasks.filter((task) => !task.deleted);
    } catch (error: any) {
      throw new MochiError("Failed to get tasks", 500, error as Error);
    }
  }

  async updateTaskAsync(id: string, task: Partial<ITask>) {
    try {
      const updatedTask = await this.taskRepo.updateAsync(id, task);
      if (!updatedTask) {
        throw new MochiError("Task not found", 404);
      }
      return updatedTask;
    } catch (error: any) {
      throw new MochiError("Failed to update task", 500, error as Error);
    }
  }

  async restoreTaskAsync(id: string) {
    try {
      const restoredTask = await this.taskRepo.updateAsync(id, {
        deleted: false,
      });
      if (!restoredTask) {
        throw new MochiError("Task not found", 404);
      }
      return restoredTask;
    } catch (error: any) {
      throw new MochiError("Failed to restore task", 500, error as Error);
    }
  }

  async deleteTaskAsync(id: string) {
    try {
      const deletedTask = await this.taskRepo.updateAsync(id, {
        deleted: true,
      });
      if (!deletedTask) {
        throw new MochiError("Task not found", 404);
      }
    } catch (error: any) {
      throw new MochiError("Failed to delete task", 500, error as Error);
    }
  }
}
