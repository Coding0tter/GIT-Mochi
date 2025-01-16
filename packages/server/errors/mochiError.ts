import type { NextFunction } from "express";

export class MochiError extends Error {
  public statusCode: number;
  public data: any;

  constructor(
    message: string,
    statusCode: number = 500,
    error?: Error,
    data?: any,
  ) {
    super(message + (error ? `: ${error.message}` : ""));
    this.statusCode = statusCode;
    this.data = data;
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
