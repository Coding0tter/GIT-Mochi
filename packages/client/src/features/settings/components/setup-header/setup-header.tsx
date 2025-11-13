import {
  SetupStep,
  setupStore,
} from "@client/features/settings/stores/setup.store.ts";
import styles from "./setup-header.module.css";
import logo from "../../../../assets/logo.svg";
import { getStepNumber } from "@client/features/settings/utils/setup.utils.ts";

const SetupHeader = () => {
  return (
    <div class={styles.header}>
      <img src={logo} alt="Mochi Logo" class={styles.logo} />
      <h1>Welcome to Mochi</h1>
      <div class={styles.progress}>
        <div
          class={styles.progressBar}
          style={{
            width: `${(getStepNumber(setupStore.currentStep) / Object.keys(SetupStep).length) * 100}%`,
          }}
        />
      </div>
    </div>
  );
};

export default SetupHeader;
