import { MochiResult } from "../utils/mochiResult";
import { MochiError } from "../errors/mochiError";
import { EventEmitterHandler } from "../events/eventEmitterHandler";
import { logError } from "../utils/logger";
import { EventRegistry } from "../events/eventRegistry";
import "reflect-metadata";

export function ruleEvent(eventNamespace: string, eventName: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const className = target.constructor.name;

    EventRegistry.getInstance().registerEmitter(
      eventName,
      eventNamespace,
      className,
      propertyKey
    );

    descriptor.value = async function (...args: any[]) {
      try {
        const result = await originalMethod.apply(this, args);

        const eventType = `${eventNamespace}.${eventName}`;

        const resultData =
          result instanceof MochiResult
            ? result
            : new MochiResult(eventType, result);

        EventEmitterHandler.getEmitter().emit(eventType, resultData);

        return result;
      } catch (error: any) {
        logError(new MochiError(`Error in ${propertyKey}`, 500, error));
        throw error;
      }
    };
  };
}
