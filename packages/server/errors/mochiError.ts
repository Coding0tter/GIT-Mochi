import type { NextFunction } from "express";

export class MochiError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number = 500, error?: Error) {
    super(message + (error ? `: ${error.message}` : ""));
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const handleControllerError = (error: unknown, next: NextFunction) => {
  if (error instanceof MochiError) {
    next(error);
  } else {
    next(new MochiError("Unexpected error occurred", 500, error as Error));
  }
};
