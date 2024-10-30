import { EventRegistry } from "../events/eventRegistry";

export function ruleAction(
  eventNamespace: string,
  eventName: string,
  hasParams = false
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const className = target.constructor.name;

    EventRegistry.getInstance().registerListener(
      eventName,
      eventNamespace,
      className,
      propertyKey,
      hasParams
    );

    descriptor.value = function (...args: any[]) {
      return originalMethod.apply(this, args);
    };
  };
}
