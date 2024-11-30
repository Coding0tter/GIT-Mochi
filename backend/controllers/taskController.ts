import type { TaskDto } from "../dtos/taskDto.js";
import type { Request, Response, NextFunction } from "express";
import { TaskService } from "../services/taskService.js";
import { handleControllerError, MochiError } from "../errors/mochiError.js";
import { ProjectService } from "../services/projectService.js";
import TaskEventEmitter from "../services/emitters/taskEventEmitter.js";

export class TaskController {
  private taskService: TaskService;
  private taskEmitter: TaskEventEmitter;
  private projectService: ProjectService;

  constructor() {
    this.taskService = new TaskService();
    this.projectService = new ProjectService();
    this.taskEmitter = new TaskEventEmitter();
  }

  createTaskAsync = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, status, description, custom } =
        req.body as Partial<TaskDto>;

      const currentProject = await this.projectService.getCurrentProjectAsync();

      if (!currentProject) {
        throw new MochiError("No project selected", 404);
      }

      const createdTask = await this.taskEmitter.createTaskAsync(
        currentProject.id,
        {
          title,
          status,
          description,
          custom,
        },
      );

      if (createdTask.error) {
        throw createdTask.error;
      }

      res.status(201).json(createdTask.data);
    } catch (error) {
      handleControllerError(error, next);
    }
  };

  getTasksAsync = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { showDeleted } = req.query;

      const currentProject = await this.projectService.getCurrentProjectAsync();

      if (!currentProject) {
        throw new MochiError("No project selected", 404);
      }

      const tasks = await this.taskService.getTasksAsync(
        currentProject.id,
        showDeleted === "true",
      );

      res.json(tasks);
    } catch (error) {
      handleControllerError(error, next);
    }
  };

  updateTaskAsync = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { title, status, description } = req.body as Partial<TaskDto>;

      const updatedTask = await this.taskEmitter.updateTaskAsync(id, {
        title,
        status,
        description,
      });

      if (updatedTask.error) {
        throw updatedTask.error;
      }

      res.status(200).json(updatedTask.data);
    } catch (error) {
      handleControllerError(error, next);
    }
  };

  updateTaskOrderAsync = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { taskOrder } = req.body;

      if (!Array.isArray(taskOrder)) {
        throw new MochiError("Task order must be an array", 400);
      }

      await this.taskService.updateTaskOrderAsync(taskOrder);

      res.status(204).send();
    } catch (error) {
      handleControllerError(error, next);
    }
  };

  restoreTaskAsync = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.params;

      const restoredTask = await this.taskService.restoreTaskAsync(id);

      res.status(200).json(restoredTask);
    } catch (error) {
      handleControllerError(error, next);
    }
  };

  deleteTaskAsync = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ids } = req.params;

      const deletePromises = ids
        .split(",")
        .map(async (id: string) => await this.taskEmitter.deleteTaskAsync(id));

      await Promise.all(deletePromises);

      res.status(204).send();
    } catch (error) {
      handleControllerError(error, next);
    }
  };
}
