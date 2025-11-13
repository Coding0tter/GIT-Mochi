import ReviewerSettings from "../reviewer-settings/reviewer-settings";
import styles from "./setup-codereview.module.css";

const SetupCodereview = () => {
  return (
    <div class={styles.container}>
      <ReviewerSettings />
    </div>
  );
};

export default SetupCodereview;
