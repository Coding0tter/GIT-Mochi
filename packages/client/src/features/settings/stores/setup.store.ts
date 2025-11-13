import { createBaseStore } from "@client/stores/baseStore.ts";
import { indexOf } from "lodash";

export enum SetupStep {
  Welcome = "welcome",
  ProjectSelection = "project-selection",
  LabelSelection = "label-selection",
  CodeReviewSetup = "code-review-setup",
  Complete = "complete",
}

interface SetupState {
  currentStep: SetupStep;
  nextDisabled?: boolean;
}

const { store: setupStore, setStore: setSetupStore } =
  createBaseStore<SetupState>({
    currentStep: SetupStep.Welcome,
  });

export { setupStore };

export const nextStep = () => {
  const index = indexOf(Object.values(SetupStep), setupStore.currentStep);
  if (index < Object.values(SetupStep).length - 1) {
    setSetupStore({ currentStep: Object.values(SetupStep)[index + 1] });
  }
};

export const previousStep = () => {
  const index = indexOf(Object.values(SetupStep), setupStore.currentStep);
  if (index > 0) {
    setSetupStore({ currentStep: Object.values(SetupStep)[index - 1] });
  }
};

export const setNextDisabled = (disabled: boolean) => {
  setSetupStore({ nextDisabled: disabled });
};
