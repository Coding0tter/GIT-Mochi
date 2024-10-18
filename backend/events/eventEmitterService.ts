import EventEmitter2 from "eventemitter2";

export class EventEmitterService {
  private static emitter: EventEmitter2;

  private constructor() {}

  public static getEmitter(): EventEmitter2 {
    if (!EventEmitterService.emitter) {
      EventEmitterService.emitter = new EventEmitter2({
        wildcard: true,
        delimiter: ".",
      });
    }

    return EventEmitterService.emitter;
  }
}
