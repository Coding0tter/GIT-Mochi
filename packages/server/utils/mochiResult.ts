export class MochiResult {
  constructor(public data: any, public error: Error | null = null) {}

  static empty() {
    return new MochiResult("", null);
  }

}
