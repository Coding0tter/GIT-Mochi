import { logInfo } from "../utils/logger";

type EventMetadata = {
  eventType: string;
  eventNamespace: string;
  className: string;
  methodName: string;
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
    logInfo(
      `Registering emitter for ${eventType} in ${className}.${methodName}`
    );
    this.emitters.push({ eventType, className, methodName, eventNamespace });
  }

  registerListener(
    eventType: string,
    eventNamespace: string,
    className: string,
    methodName: string
  ) {
    logInfo(
      `Registering listener for ${eventType} in ${className}.${methodName}`
    );
    this.listeners.push({ eventType, className, methodName, eventNamespace });
  }

  getEmitters() {
    return this.emitters;
  }

  getListeners() {
    return this.listeners;
  }
}
