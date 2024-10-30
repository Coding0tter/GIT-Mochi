import { JSX } from "solid-js";
import BaseModal, { BaseModalProps } from "../BaseModal/BaseModal";
import styles from "./HelpModal.module.css";
import Badge from "../../Badge/Badge";

const KEYBINDINGS = [
  // Navigation
  { section: "Navigation", key: "W / ↑", description: "Move up through tasks" },
  {
    section: "Navigation",
    key: "S / ↓",
    description: "Move down through tasks",
  },
  {
    section: "Navigation",
    key: "A / ←",
    description: "Switch to the previous column",
  },
  {
    section: "Navigation",
    key: "D / →",
    description: "Switch to the next column",
  },
  {
    section: "Navigation",
    key: "N / Shift + → / Shift + D",
    description: "Move task to the next state",
  },
  {
    section: "Navigation",
    key: "P / Shift + ← / Shift + A",
    description: "Move task to the previous state",
  },

  // Task Management
  { section: "Task Management", key: "C", description: "Create new task" },
  { section: "Task Management", key: "E", description: "Edit selected task" },
  { section: "Task Management", key: "X", description: "Delete selected task" },
  { section: "Task Management", key: "V", description: "View deleted tasks" },
  {
    section: "Task Management",
    key: "Shift + R",
    description: "Restore selected task",
  },

  // Viewing & Searching
  {
    section: "Viewing & Searching",
    key: "Strg + F",
    description: "Search for tasks",
  },
  {
    section: "Viewing & Searching",
    key: "Strg + P",
    description: "Open commandline",
  },
  {
    section: "Viewing & Searching",
    key: "Spacebar",
    description: "Toggle resolved comments visibility",
  },

  // GitLab Actions
  {
    section: "GitLab Actions",
    key: "Shift + M",
    description: "Create merge request and branch from issue",
  },
  {
    section: "GitLab Actions",
    key: "Shift + O",
    description: "Open selected task in GitLab",
  },
  {
    section: "GitLab Actions",
    key: "Shift + S",
    description: "Sync merge requests from GitLab",
  },

  // Utility Commands
  {
    section: "Utility Commands",
    key: "Escape",
    description: "Close all modals",
  },
  {
    section: "Utility Commands",
    key: "H",
    description: "Open this help modal",
  },
];

interface HelpModalProps extends BaseModalProps {}

const HelpModal = (props: HelpModalProps): JSX.Element => {
  // Group keybindings by section
  const groupedKeybindings = KEYBINDINGS.reduce((groups, binding) => {
    if (!groups[binding.section]) groups[binding.section] = [];
    groups[binding.section].push(binding);
    return groups;
  }, {} as Record<string, typeof KEYBINDINGS>);

  return (
    <BaseModal {...props} closeText="Close">
      <div class={styles.helpWrapper}>
        <div class={styles.helpSection}>
          <h2>Keybindings</h2>

          <p>
            This tool allows you to manage tasks efficiently. Here are the
            keyboard shortcuts:
          </p>
          <div class={styles.keybindingsWrapper}>
            {Object.keys(groupedKeybindings).map((section) => (
              <div>
                <h3>{section}</h3>
                <ul class={styles["keybindings-list"]}>
                  {groupedKeybindings[section].map((binding) => (
                    <li>
                      <strong>
                        {binding.key.split(" / ").map((key) => (
                          <kbd>{key}</kbd>
                        ))}
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
