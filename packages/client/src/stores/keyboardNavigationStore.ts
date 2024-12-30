import { createStore } from "solid-js/store";

export const [keyboardNavigationStore, setKeyboardNavigationStore] =
  createStore({
    selectedColumnIndex: 0,
    selectedTaskIndex: 0,
    selectedTaskIndexes: [0] as number[],
    selectedDayIndex: 0,
    selectedHourIndex: 0,
    selectedQuarterHourIndex: 0,
    selectedQuarterHourIndexes: [0] as number[],
    selectedAppointmentIndex: 0,
    
  });

const updateStoreIndex = <T>(
  key: keyof typeof keyboardNavigationStore,
  updater: T | ((prev: T) => T)
) => {
  const prevValue = keyboardNavigationStore[key];
  const newValue =
    typeof updater === "function" ? (updater as Function)(prevValue) : updater;

  // Validate only if the value is a single number and check for NaN
  if (typeof newValue === "number" && isNaN(newValue)) return;

  setKeyboardNavigationStore(key, newValue);
};

// Individual setter functions using the generic update function
export const setSelectedColumnIndex = (
  updater: number | ((prev: number) => number)
) => updateStoreIndex("selectedColumnIndex", updater);

export const setSelectedTaskIndex = (
  updater: number | ((prev: number) => number)
) => updateStoreIndex("selectedTaskIndex", updater);

export const setSelectedTaskIndexes = (
  updater: number[] | ((prev: number[]) => number[])
) => updateStoreIndex("selectedTaskIndexes", updater);

export const setSelectedDayIndex = (
  updater: number | ((prev: number) => number)
) => updateStoreIndex("selectedDayIndex", updater);

export const setSelectedHourIndex = (
  updater: number | ((prev: number) => number)
) => updateStoreIndex("selectedHourIndex", updater);

export const setSelectedQuarterHourIndex = (
  updater: number | ((prev: number) => number)
) => updateStoreIndex("selectedQuarterHourIndex", updater);

export const setSelectedQuarterHourIndexes = (
  updater: number[] | ((prev: number[]) => number[])
) => updateStoreIndex("selectedQuarterHourIndexes", updater);

export const setSelectedAppointmentIndex = (
  updater: number | ((prev: number) => number)
) => updateStoreIndex("selectedAppointmentIndex", updater);
