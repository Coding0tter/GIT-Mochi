import { logInfo } from "../utils/logger";

type EventMetadata = {
  eventType: string;
  eventNamespace: string;
  className: string;
  methodName: string;
  hasParams?: boolean;
};

export class EventRegistry {
  private static instance: EventRegistry;
  private emitters: EventMetadata[] = [];
  private listeners: EventMetadata[] = [];

  private constructor() {}

  static getInstance() {
    if (!EventRegistry.instance) {
      EventRegistry.instance = new EventRegistry();
    }

    return EventRegistry.instance;
  }

  registerEmitter(
    eventType: string,
    eventNamespace: string,
    className: string,
    methodName: string
  ) {
    this.emitters.push({ eventType, className, methodName, eventNamespace });
  }

  registerListener(
    eventType: string,
    eventNamespace: string,
    className: string,
    methodName: string,
    hasParams: boolean
  ) {
    this.listeners.push({
      eventType,
      className,
      methodName,
      eventNamespace,
      hasParams,
    });
  }

  getEmitters() {
    return this.emitters;
  }

  getListeners() {
    return this.listeners;
  }

  getListenerByEvent(event: string) {
    const [eventNamespace, eventType] = event.split(".");
    return this.listeners.find(
      (listener) =>
        listener.eventNamespace == eventNamespace &&
        listener.eventType === eventType
    );
  }
}
