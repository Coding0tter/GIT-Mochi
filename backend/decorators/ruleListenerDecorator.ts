import { EventRegistry } from "../events/eventRegistry";

export function ruleAction(eventType: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const className = target.constructor.name;
    EventRegistry.getInstance().registerListener(
      eventType,
      className,
      propertyKey
    );

    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      return originalMethod.apply(this, args);
    };
  };
}
