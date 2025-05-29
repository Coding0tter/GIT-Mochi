import { groupBy } from "lodash";
import { createEffect } from "solid-js";
import { COMMANDS } from "../../../commandPipeline";
import { CommandProcessor } from "../../../commandPipeline/commandProcessor";
import { STATES } from "../../../constants";
import { unfocusInputs } from "../../../services/uiService";
import {
  commandStore,
  filteredDropdownValues,
  setActiveDropdownIndex,
  setCommandProcessor,
  setDropdownValues,
} from "../../../stores/commandStore";
import {
  setSelectedColumnIndex,
  setSelectedTaskIndex,
  setSelectedTaskIndexes,
} from "../../../stores/keyboardNavigationStore";
import { filteredTasks } from "../../../stores/taskStore";
import {
  InputMode,
  LoadingTarget,
  setCommandInputRef,
  setCommandInputValue,
  setCommandPlaceholder,
  uiStore,
} from "../../../stores/uiStore";
import styles from "./CommandLine.module.css";

const CommandLine = () => {
  createEffect(() => {
    if (uiStore.inputMode === InputMode.Commandline) {
      setCommandInputValue("");
      setDropdownValues([
        ...COMMANDS.map((command) => ({
          value: command,
          text: command.name,
          description: command.description,
        })),
      ]);
    }

    getPlaceholder();
  }, [uiStore.inputMode]);

  const getPlaceholder = () => {
    switch (uiStore.inputMode) {
      case InputMode.Search:
        setCommandPlaceholder("Search tasks...");
        break;
      case InputMode.Commandline:
        setCommandPlaceholder("Type a command...");
        break;
      default:
        setCommandPlaceholder(
          "Strg + F to search / Strg + P to open commandline",
        );
        break;
    }
  };

  const handleInput = (event: Event) => {
    const input = event.target as HTMLInputElement;
    setCommandInputValue(input.value);
    setActiveDropdownIndex(0);
    if (uiStore.inputMode === InputMode.Search) {
      setCommandInputValue(input.value);
    }
  };

  const handleKeydown = async (event: KeyboardEvent) => {
    if (uiStore.inputMode === InputMode.Commandline) {
      let newSelectedCommand = commandStore.activeDropdownIndex;

      if (event.key === "ArrowDown") {
        newSelectedCommand =
          (commandStore.activeDropdownIndex + 1) %
          filteredDropdownValues().length;
      } else if (event.key === "ArrowUp") {
        newSelectedCommand =
          (commandStore.activeDropdownIndex -
            1 +
            filteredDropdownValues().length) %
          filteredDropdownValues().length;
      } else if (event.key === "Enter") {
        handleCommandAsync();
        return;
      }

      setActiveDropdownIndex(newSelectedCommand);
      document
        .getElementById(`command-item-${newSelectedCommand}`)
        ?.scrollIntoView({ block: "nearest" });
    } else if (uiStore.inputMode === InputMode.Search) {
      setTimeout(() => {
        const statesWithTasks = Object.keys(groupBy(filteredTasks(), "status"));

        const firstStateWithTasks = STATES.findIndex((state) => {
          return statesWithTasks.includes(state.id);
        });

        setSelectedColumnIndex(firstStateWithTasks);
        setSelectedTaskIndex(0);
        setSelectedTaskIndexes([0]);
      });

      if (event.key === "Enter") {
        unfocusInputs();
      }
    }
  };

  const handleCommandAsync = async () => {
    if (!commandStore.activeCommandProcessor) {
      const commandProcessor = new CommandProcessor();
      setCommandProcessor(commandProcessor);
      await commandProcessor.start();
    } else if (commandStore.activeCommandProcessor) {
      commandStore.activeCommandProcessor?.receiveInput(
        uiStore.commandInputValue,
      );
    }
  };

  return (
    <div
      class={`${styles.commandline} ${
        uiStore.inputMode !== InputMode.None ? styles.active : ""
      }`}
    >
      <div class={styles.commandlineInput}>
        {uiStore.inputMode === InputMode.Search && (
          <i class="fa-solid fa-magnifying-glass"></i>
        )}
        {uiStore.inputMode === InputMode.Commandline && (
          <i class="fa-solid fa-terminal"></i>
        )}
        {uiStore.commandInputValue === "" && (
          <div
            class={styles.placeholder}
            innerHTML={uiStore.commandPlaceholder}
          ></div>
        )}
        <input
          ref={(el) => setCommandInputRef(el)}
          type="text"
          readOnly={uiStore.commandReadonly}
          value={
            uiStore.loadingTarget === LoadingTarget.Commandline
              ? "Loading..."
              : uiStore.commandInputValue
          }
          onKeyDown={handleKeydown}
          onInput={handleInput}
        />
      </div>
      {uiStore.inputMode === InputMode.Commandline &&
        filteredDropdownValues().length > 0 && (
          <ul class={styles.dropdown}>
            {filteredDropdownValues().map((item, index) => (
              <li
                id={`command-item-${index}`}
                class={styles.dropdownItem}
                onClick={handleCommandAsync}
                style={{
                  background:
                    commandStore.activeDropdownIndex === index
                      ? "rgba(255, 255, 255, 0.1)"
                      : "none",
                }}
              >
                {item.text}
                {item?.description && " - (" + item.description + ")"}
              </li>
            ))}
          </ul>
        )}
    </div>
  );
};

export default CommandLine;
