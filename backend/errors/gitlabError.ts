export class GitlabError extends Error {
  public statusCode: number;
  public originalError?: Error;

  constructor(
    message: string,
    statusCode: number = 500,
    originalError?: Error
  ) {
    super(message);
    this.name = "GitlabError";
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}
