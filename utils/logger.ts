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

export const logError = (message: string): void => {
  addLog(message, MessageType.ERROR);
};
