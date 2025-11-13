import BaseModal, {
  type BaseModalProps,
} from "@client/components/modals/BaseModal/BaseModal";
import Badge from "@client/components/shared/Badge/Badge";
import ShortcutRegistry from "@client/shortcutMaps/shortcutRegistry";
import type { Shortcut } from "@client/shortcutMaps/types";
import { useLocation } from "@solidjs/router";
import { type JSXElement, createSignal, onMount } from "solid-js";
import styles from "./HelpModal.module.css";
import { modalStore } from "@client/shared/stores/modal.store.ts";

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
    const baseMap = ShortcutRegistry.getInstance().getShortcutsByKey("base");

    const key = location.pathname.split("/").slice(1).join("/");
    const locationMap = ShortcutRegistry.getInstance().getShortcutsByKey(key);

    let allShortcuts = baseMap?.shortcuts.concat(locationMap?.shortcuts || []);

    if (modalStore.activeModals.length >= 2) {
      const modalMap = ShortcutRegistry.getInstance().getShortcutsByKey(
        modalStore.activeModals.at(-2)!,
      );

      allShortcuts = baseMap?.shortcuts.concat(modalMap?.shortcuts || []);
    }

    setShortcuts(allShortcuts || []);
  });

  const groupedShortcuts = () => groupShortcutsByCategory(shortcuts());

  const renderKeyCombination = (binding: Shortcut) => {
    const modifiers: string[] = [];
    if (binding.ctrlKey) modifiers.push("Ctrl");
    if (binding.shiftKey) modifiers.push("Shift");
    if (binding.altKey) modifiers.push("Alt");

    const keys = Array.isArray(binding.key) ? binding.key : [binding.key];

    return (
      <div class={styles.shortcutKeys}>
        {modifiers.map((mod) => (
          <kbd>{mod}</kbd>
        ))}
        {modifiers.length > 0 && <span>+</span>}
        {keys.map((key, index) => (
          <>
            <kbd>{key}</kbd>
            {index < keys.length - 1 && <span>/</span>}
          </>
        ))}
      </div>
    );
  };

  return (
    <BaseModal {...props} closeText="Close">
      <div class={styles.helpWrapper}>
        <div class={styles.shortcutsSection}>
          <div class={styles.categoriesGrid}>
            {Object.entries(groupedShortcuts()).map(([category, bindings]) => (
              <div class={styles.categoryCard}>
                <h3 class={styles.categoryTitle}>{category}</h3>
                <ul class={styles["keybindings-list"]}>
                  {bindings.map((binding) => (
                    <li>
                      {renderKeyCombination(binding)}
                      <span class={styles.shortcutDescription}>
                        {binding.description}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div class={styles.legendSection}>
          <h2 class={styles.sectionTitle}>Task Types</h2>
          <div class={styles.legendGrid}>
            <div class={styles.legendItem}>
              <Badge type="deleted">Deleted</Badge>
              <span class={styles.legendLabel}>Deleted</span>
            </div>
            <div class={styles.legendItem}>
              <Badge type="custom">Custom</Badge>
              <span class={styles.legendLabel}>Custom</span>
            </div>
            <div class={styles.legendItem}>
              <Badge type="mergeRequest">MR</Badge>
              <span class={styles.legendLabel}>MR</span>
            </div>
            <div class={styles.legendItem}>
              <Badge type="issue">Issue</Badge>
              <span class={styles.legendLabel}>Issue</span>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default HelpModal;
