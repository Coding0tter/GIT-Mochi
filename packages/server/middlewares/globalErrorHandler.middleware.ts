import { MochiError } from "../errors/mochi.error.js";
import { logError } from "../utils/logger.js";
import type { Request, Response, NextFunction } from "express";

export const globalErrorHandler = (
  err: MochiError | Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof MochiError) {
    logError(err);

    res.status(err.statusCode).json({
      ok: false,
      message: err.message,
      data: err.data ?? null,
    });
    return;
  }

  const wrapped = new MochiError(
    "Unexpected error occurred",
    500,
    err as Error,
  );
  logError(wrapped);

  res.status(500).json({
    ok: false,
    message: "Unexpected error occurred",
    code: "UNEXPECTED",
    data: null,
  });
};
