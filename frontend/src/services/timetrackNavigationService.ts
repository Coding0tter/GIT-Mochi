import { uniq } from "lodash";
import {
  keyboardNavigationStore,
  setSelectedDayIndex,
  setSelectedHourIndex,
  setSelectedQuarterHourIndex,
  setSelectedQuarterHourIndexes,
} from "../stores/keyboardNavigationStore";
import { Direction } from "./taskNavigationService";

export const moveSelection = (direction: Direction, moveHourly = false) => {
  const { selectedQuarterHourIndex, selectedHourIndex, selectedDayIndex } =
    keyboardNavigationStore;

  const adjustHourAndQuarter = (newHour: number, newQuarter: number) => {
    setSelectedHourIndex(newHour);
    setSelectedQuarterHourIndex(newQuarter);
  };

  const adjustDayIndex = (newIndex: number) => setSelectedDayIndex(newIndex);

  switch (direction) {
    case Direction.Up:
      if (moveHourly) {
        adjustHourAndQuarter(
          selectedHourIndex === 8 ? 20 : selectedHourIndex - 1,
          selectedQuarterHourIndex
        );
      } else {
        selectedQuarterHourIndex === 0
          ? selectedHourIndex === 8
            ? adjustHourAndQuarter(20, 3)
            : adjustHourAndQuarter(selectedHourIndex - 1, 3)
          : setSelectedQuarterHourIndex(selectedQuarterHourIndex - 1);
      }
      break;

    case Direction.Down:
      if (moveHourly) {
        adjustHourAndQuarter(
          selectedHourIndex === 20 ? 8 : selectedHourIndex + 1,
          selectedQuarterHourIndex
        );
      } else {
        selectedQuarterHourIndex === 3
          ? selectedHourIndex === 20
            ? adjustHourAndQuarter(8, 0)
            : adjustHourAndQuarter(selectedHourIndex + 1, 0)
          : setSelectedQuarterHourIndex(selectedQuarterHourIndex + 1);
      }
      break;

    case Direction.Left:
      adjustDayIndex(selectedDayIndex === 0 ? 6 : selectedDayIndex - 1);
      break;

    case Direction.Right:
      adjustDayIndex(selectedDayIndex === 6 ? 0 : selectedDayIndex + 1);
      break;
  }

  setSelectedQuarterHourIndexes([
    keyboardNavigationStore.selectedHourIndex * 4 +
      keyboardNavigationStore.selectedQuarterHourIndex,
  ]);
};

export const addToSelection = (direction: Direction, moveHourly = false) => {
  const { selectedHourIndex, selectedQuarterHourIndex } =
    keyboardNavigationStore;

  const baseIndex = selectedHourIndex * 4 + selectedQuarterHourIndex;
  const startQuarters = 8 * 4;
  const endQuarters = 21 * 4;
  let selectedQuarter = 0;

  switch (direction) {
    case Direction.Up:
      setSelectedHourIndex(() => {
        const newIndex = baseIndex - (moveHourly ? 4 : 1);
        return Math.max(Math.floor(newIndex / 4), 8);
      });
      setSelectedQuarterHourIndex(() => {
        const newIndex = baseIndex - (moveHourly ? 4 : 1);
        return newIndex >= startQuarters
          ? newIndex % 4
          : selectedQuarterHourIndex;
      });

      selectedQuarter =
        keyboardNavigationStore.selectedHourIndex * 4 +
        keyboardNavigationStore.selectedQuarterHourIndex;

      setSelectedQuarterHourIndexes((prev) => [
        ...prev.filter((index) => index <= prev[0]! || index < selectedQuarter),
        ...(prev.at(0)! > selectedQuarter
          ? moveHourly
            ? Array.from({ length: 4 }, (_, i) =>
                Math.max(baseIndex - 4 + i, 0)
              )
            : [Math.max(baseIndex - 1, 0)]
          : [selectedQuarter]),
      ]);
      break;

    case Direction.Down:
      setSelectedHourIndex(() => {
        const newIndex = baseIndex + (moveHourly ? 4 : 1);
        return Math.min(Math.floor(newIndex / 4), 20);
      });
      setSelectedQuarterHourIndex(() => {
        const newIndex = baseIndex + (moveHourly ? 4 : 1);
        return newIndex < endQuarters ? newIndex % 4 : selectedQuarterHourIndex;
      });

      selectedQuarter =
        keyboardNavigationStore.selectedHourIndex * 4 +
        keyboardNavigationStore.selectedQuarterHourIndex;

      setSelectedQuarterHourIndexes((prev) => [
        ...prev.filter((index) => index >= prev[0]! || index > selectedQuarter),
        ...(prev.at(0)! < selectedQuarter
          ? moveHourly
            ? Array.from({ length: 4 }, (_, i) =>
                Math.min(baseIndex + 1 + i, endQuarters - 1)
              )
            : [Math.min(baseIndex + 1, endQuarters - 1)]
          : [selectedQuarter]),
      ]);
      break;
  }
};
