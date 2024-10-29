import { JSX } from "solid-js";
import BaseModal, { BaseModalProps } from "../BaseModal/BaseModal";
import styles from "./HelpModal.module.css";

const KEYBINDINGS = [
  { key: "W / ↑", description: "Move up through tasks" },
  { key: "S / ↓", description: "Move down through tasks" },
  { key: "A / ←", description: "Switch to the previous column" },
  { key: "D / →", description: "Switch to the next column" },

  {
    key: "N / Shift + → / Shift + d",
    description: "Move the selected task to the next state",
  },
  {
    key: "P / Shift + ← / Shift + a",
    description: "Move the selected task to the previous state",
  },
  { key: "C", description: "Create new task" },
  { key: "E", description: "Edit selected task" },
  {
    key: "X",
    description: "Delete Task",
  },
  {
    key: "V",
    description: "View deleted Tasks",
  },
  {
    key: "Shift + R",
    description: "Restore selected task",
  },
  {
    key: "Shift + F / Strg + P",
    description: "Search for tasks",
  },
  {
    key: "Shift + M",
    description: "Create merge request and branch from issue",
  },
  { key: "Shift + O", description: "Open selected task in GitLab" },
  { key: "Spacebar", description: "Toggle resolved comments visibility" },
  { key: "Escape", description: "Close all modals" },
  { key: "Shift + S", description: "Sync Merge Requests from GitLab" },
  { key: "H", description: "Open this help modal" },
];

interface HelpModalProps extends BaseModalProps {}

const HelpModal = (props: HelpModalProps): JSX.Element => {
  return (
    <BaseModal {...props} closeText="Close">
      <h2>Help - Keybindings</h2>
      <div class={styles.helpWrapper}>
        <p>
          This tool allows you to manage tasks efficiently. Here are the
          keyboard shortcuts:
        </p>
        <ul class={styles["keybindings-list"]}>
          {KEYBINDINGS.map((binding) => (
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
    </BaseModal>
  );
};

export default HelpModal;
