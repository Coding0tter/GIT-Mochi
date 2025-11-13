import { SetupStep } from "@client/features/settings/stores/setup.store.ts";

export const getStepNumber = (step: SetupStep): number => {
  const steps = Object.values(SetupStep);
  return steps.indexOf(step) + 1;
};
