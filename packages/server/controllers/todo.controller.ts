import { handleControllerError } from "@server/errors/mochi.error.ts";
import { TodoService } from "@server/services/todo.service.ts";
import type { NextFunction, Request, Response } from "express";

export class TodoController {
  private _service: TodoService;

  constructor() {
    this._service = new TodoService();
  }

  getTodos = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(await this._service.getAll());
    } catch (error) {
      handleControllerError(error, next);
    }
  };

  markDone = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.body.id;

      if (!id) {
        res.status(400).json({ message: "Todo ID is required" });
        return;
      }

      await this._service.markDone(id);
      res.status(200).json({ message: "Todo marked as done" });
    } catch (error) {
      handleControllerError(error, next);
    }
  };
}
