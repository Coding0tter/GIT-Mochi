import type { KeyboardShortcutMap, Shortcut } from "./types";

class ShortcutRegistry {
  private static instance: ShortcutRegistry;

  private static shortcutMaps: KeyboardShortcutMap[] = [];

  private constructor() {}

  public static getInstance(): ShortcutRegistry {
    if (!ShortcutRegistry.instance) {
      ShortcutRegistry.instance = new ShortcutRegistry();
    }

    return ShortcutRegistry.instance;
  }

  public registerShortcut(shortcutMap: KeyboardShortcutMap) {
    if (!ShortcutRegistry.shortcutMaps.some((sc) => sc.key === shortcutMap.key))
      ShortcutRegistry.shortcutMaps.push(shortcutMap);
  }

  public async initializeAsync() {
    const shortcutModules = import.meta.glob("./*ShortcutMap.ts");

    for (const path in shortcutModules) {
      await shortcutModules[path](); // This will load each command file
    }
  }

  public getShortcutsByKey(key: string) {
    return ShortcutRegistry.shortcutMaps.find((sc) => sc.key === key);
  }

  public resetShortcutRegistry() {
    ShortcutRegistry.shortcutMaps.length = 0;
  }

  public executeShortcut(mapKey: string, event: KeyboardEvent) {
    const { key, shiftKey, ctrlKey } = event;

    const baseMap = this.getShortcutsByKey("base");
    const map = this.getShortcutsByKey(mapKey);

    const shortCuts = baseMap?.shortcuts.concat(map?.shortcuts || []);
    if (shortCuts === undefined || shortCuts?.length === 0) return;

    const shortcut = shortCuts.find((sc: Shortcut) => {
      if (Array.isArray(sc.key)) {
        return (
          sc.key.includes(key) &&
          ((sc.shiftKey === undefined && !shiftKey) ||
            sc.shiftKey === shiftKey) &&
          ((sc.ctrlKey === undefined && !ctrlKey) || sc.ctrlKey === ctrlKey)
        );
      } else {
        return (
          sc.key === key &&
          ((sc.shiftKey === undefined && !shiftKey) ||
            sc.shiftKey === shiftKey) &&
          ((sc.ctrlKey === undefined && !ctrlKey) || sc.ctrlKey === ctrlKey)
        );
      }
    });

    if (shortcut) {
      event.preventDefault();
      event.stopPropagation();
      shortcut.action();
    }
  }
}

export default ShortcutRegistry;
