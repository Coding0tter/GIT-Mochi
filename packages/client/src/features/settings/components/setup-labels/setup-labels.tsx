import LabelSettings from "../label-settings/label-settings";
import styles from "./setup-labels.module.css";

const SetupLabels = () => {
  return (
    <div class={styles.labelsStep}>
      <h2>Configure Kanban Labels</h2>
      <p>
        Assign Gitlab labels to columsn to automatically set labels when card is
        moved to it. Also new entries will be moved to column if possible
      </p>

      <LabelSettings />
    </div>
  );
};

export default SetupLabels;
