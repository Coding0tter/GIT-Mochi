import { AsyncLocalStorage } from "async_hooks";

export enum ContextKeys {
  Project = "currentProject",
}

export const asyncLocalStorage = new AsyncLocalStorage<Map<string, any>>();

export function setContext(key: string, value: any) {
  const store = asyncLocalStorage.getStore();
  if (store) {
    store.set(key, value);
  }
}

export function getContext(key: string) {
  const store = asyncLocalStorage.getStore();
  if (store) {
    return store.get(key);
  }
}

export function clearContext() {
  asyncLocalStorage.run(new Map(), () => {});
}
