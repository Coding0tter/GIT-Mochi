import { MochiError } from "../errors/mochi.error.js";
import { logError } from "../utils/logger.js";
import type { Request, Response, NextFunction } from "express";

export const globalErrorHandler = (
  err: MochiError | Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof MochiError) {
    res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
    logError(err);
  } else {
    res.status(500).json({
      status: "error",
      message: "Unexpected error occurred",
    });
    logError(new MochiError("unhandled error", 500));
  }
};
