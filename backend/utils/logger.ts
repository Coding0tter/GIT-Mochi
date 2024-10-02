import type { MochiError } from "./error";

export enum MessageType {
  INFO = "INFO",
  ERROR = "ERROR",
}

export const addLog = (message: string, type: MessageType): void => {
  console.log(`[BACKEND] [${type}] [${new Date().toISOString()}] ${message}`);
};

export const logInfo = (message: string): void => {
  addLog(message, MessageType.INFO);
};

export const logError = (error: MochiError): void => {
  addLog(`${error.message} ${error?.stack ?? ""}`, MessageType.ERROR);
};
