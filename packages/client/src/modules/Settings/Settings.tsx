import ReviewerSettings from "@client/components/Settings/Reviewer/Reviewer";
import styles from "./Settings.module.css";
import Card from "@client/components/shared/Card/Card";
import LabelOrderSettings from "@client/components/Settings/LabelOrder/LabelOrder";

const Settings = () => {
  return (
    <div class={styles.content}>
      <div class={styles.header}>Settings</div>
      <div class={styles.row}>
        <Card>
          <ReviewerSettings />
        </Card>
        <Card>
          <LabelOrderSettings />
        </Card>
      </div>
    </div>
  );
};

export default Settings;
