import type { TaskDto } from "../dtos/taskDto.js";
import { Setting } from "../models/setting.js";
import { Task } from "../models/task.js";
import type { Request, Response } from "express";

export const createTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { title, status, description } = req.body as Partial<TaskDto>;

    const currentProjectId = await Setting.findOne({ key: "currentProject" });
    if (!currentProjectId) throw new Error("No project selected");

    const task = new Task({
      title,
      status,
      description,
      custom: true,
      projectId: currentProjectId.value,
    });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Failed to create task" });
  }
};

export const getTasks = async (req: Request, res: Response) => {
  const { showDeleted } = req.query;

  const currentProjectId = await Setting.findOne({ key: "currentProject" });
  if (!currentProjectId) throw new Error("No project selected");

  const tasks = await Task.find({ projectId: currentProjectId.value });
  const filteredTasks =
    showDeleted === "true" ? tasks : tasks.filter((task) => !task.deleted);
  res.json(filteredTasks);
};

export const updateTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, title, description } = req.body;
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { status, title, description },
      { new: true }
    );
    if (!updatedTask) {
      res.status(404).json({ error: "Task not found" });
      return;
    }
    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Failed to update task" });
  }
};

export const restoreTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const restoredTask = await Task.findByIdAndUpdate(
      id,
      { deleted: false },
      { new: true }
    );
    if (!restoredTask) {
      res.status(404).json({ error: "Task not found" });
      return;
    }
    res.status(200).json(restoredTask);
  } catch (error) {
    console.error("Error restoring task:", error);
    res.status(500).json({ error: "Failed to restore task" });
  }
};

export const deleteTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedTask = await Task.findByIdAndUpdate(
      id,
      { deleted: true },
      { new: true }
    );
    if (!deletedTask) {
      res.status(404).json({ error: "Task not found" });
      return;
    }
    res.status(200).json({ message: "Task flagged as deleted" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Failed to delete task" });
  }
};
