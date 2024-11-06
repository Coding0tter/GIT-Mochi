import {
  keyboardNavigationStore,
  setSelectedDayIndex,
  setSelectedHourIndex,
  setSelectedQuarterHourIndex,
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
};
