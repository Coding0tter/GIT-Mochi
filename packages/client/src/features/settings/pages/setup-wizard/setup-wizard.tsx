import Button from "@client/components/shared/Button/Button.tsx";
import SetupCodereview from "@client/features/settings/components/setup-codereview/setup-codereview.tsx";
import SetupComplete from "@client/features/settings/components/setup-complete/setup-complete.tsx";
import SetupHeader from "@client/features/settings/components/setup-header/setup-header.tsx";
import SetupLabels from "@client/features/settings/components/setup-labels/setup-labels.tsx";
import SetupProject from "@client/features/settings/components/setup-project/setup-project.tsx";
import SetupWelcome from "@client/features/settings/components/setup-welcome/setup-welcome.tsx";
import {
  nextStep,
  previousStep,
  SetupStep,
  setupStore,
} from "@client/features/settings/stores/setup.store.ts";
import { Match, Show, Switch } from "solid-js";
import styles from "./setup-wizard.module.css";

const SetupWizard = () => {
  return (
    <div class={styles.setupWizard}>
      <SetupHeader />
      <div class={styles.content}>
        <Switch>
          <Match when={setupStore.currentStep === SetupStep.Welcome}>
            <SetupWelcome />
          </Match>

          <Match when={setupStore.currentStep === SetupStep.ProjectSelection}>
            <SetupProject />
          </Match>

          <Match when={setupStore.currentStep === SetupStep.LabelSelection}>
            <SetupLabels />
          </Match>

          <Match when={setupStore.currentStep === SetupStep.CodeReviewSetup}>
            <SetupCodereview />
          </Match>

          <Match when={setupStore.currentStep === SetupStep.Complete}>
            <SetupComplete />
          </Match>
        </Switch>
        <Show
          when={
            setupStore.currentStep !== SetupStep.Welcome &&
            setupStore.currentStep !== SetupStep.Complete
          }
        >
          <div class={styles.actions}>
            <Button type="secondary" onClick={() => previousStep()}>
              Back
            </Button>

            <Button
              type="primary"
              disabled={setupStore.nextDisabled}
              onClick={() => nextStep()}
            >
              Next
            </Button>
          </div>
        </Show>
      </div>
    </div>
  );
};

export default SetupWizard;
