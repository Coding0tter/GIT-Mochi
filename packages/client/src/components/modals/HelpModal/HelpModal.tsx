import BaseModal, {
  type BaseModalProps,
} from "@client/components/modals/BaseModal/BaseModal";
import Badge from "@client/components/shared/Badge/Badge";
import ShortcutRegistry from "@client/shortcutMaps/shortcutRegistry";
import type { Shortcut } from "@client/shortcutMaps/types";
import { modalStore } from "@client/stores/modalStore";
import { useLocation } from "@solidjs/router";
import { type JSXElement, createSignal, onMount } from "solid-js";
import styles from "./HelpModal.module.css";

interface HelpModalProps extends BaseModalProps {}

const HelpModal = (props: HelpModalProps): JSXElement => {
  const location = useLocation();
  const [shortcuts, setShortcuts] = createSignal<Shortcut[]>([]);

  const groupShortcutsByCategory = (shortcuts: Shortcut[]) => {
    return shortcuts.reduce(
      (acc: Record<string, Shortcut[]>, shortcut: Shortcut) => {
        const { category } = shortcut;
        if (!acc[category]) acc[category] = [];
        acc[category].push(shortcut);
        return acc;
      },
      {},
    );
  };

  onMount(() => {
    const { pathname } = location;
    const baseMap = ShortcutRegistry.getInstance().getShortcutsByKey("base");

    const locationMap = ShortcutRegistry.getInstance().getShortcutsByKey(
      pathname.split("/")[1],
    );

    const allShortcuts = baseMap?.shortcuts.concat(
      locationMap?.shortcuts || [],
    );

    if (modalStore.activeModals.length >= 2) {
      const modalMap = ShortcutRegistry.getInstance().getShortcutsByKey(
        modalStore.activeModals.at(-2)!,
      );

      allShortcuts?.push(...(modalMap?.shortcuts || []));
    }

    setShortcuts(allShortcuts || []);
  });

  const groupedShortcuts = () => groupShortcutsByCategory(shortcuts());

  return (
    <BaseModal {...props} closeText="Close">
      <div class={styles.helpWrapper}>
        <div class={styles.helpSection}>
          <h2>Keybindings</h2>

          <p class={styles.subHeading}>
            This tool allows you to manage tasks efficiently. Here are the
            keyboard shortcuts:
          </p>
          <div class={styles.keybindingsWrapper}>
            {Object.entries(groupedShortcuts()).map(([category, bindings]) => (
              <div>
                <h3>{category}</h3>
                <ul class={styles["keybindings-list"]}>
                  {bindings.map((binding) => (
                    <li>
                      <strong>
                        {Array.isArray(binding.key) ? (
                          binding.key.map((key) => (
                            <kbd>
                              {binding.ctrlKey ? "Ctrl + " : ""}
                              {binding.shiftKey ? "Shift + " : ""}
                              {binding.altKey ? "Alt + " : ""}
                              {key}
                            </kbd>
                          ))
                        ) : (
                          <kbd>
                            {binding.ctrlKey ? "Ctrl + " : ""}
                            {binding.shiftKey ? "Shift + " : ""}
                            {binding.altKey ? "Alt + " : ""}
                            {binding.key}
                          </kbd>
                        )}
                        :
                      </strong>{" "}
                      {binding.description}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div class={styles.helpSection}>
          <h2>Legend</h2>
          <Badge type="deleted">Deleted</Badge>
          <Badge type="custom">Custom Task</Badge>
          <Badge type="mergeRequest">Merge Request</Badge>
          <Badge type="issue">Issue</Badge>
        </div>
      </div>
    </BaseModal>
  );
};

export default HelpModal;
