import { EventRegistry } from "../events/eventRegistry";

type RuleActionDecoratorProps = {
  eventNamespace: string;
  eventName: string;
  hasParams?: boolean;
};

export function ruleAction(props: RuleActionDecoratorProps) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const { eventNamespace, eventName, hasParams } = props;
    const className = target.constructor.name;

    // Register the decorated method in the EventRegistry immediately
    EventRegistry.getInstance().registerListener(
      eventName,
      eventNamespace,
      className,
      propertyKey,
      hasParams ?? false
    );

    // No need to wrap descriptor.value; just return it as is
    return descriptor;
  };
}
