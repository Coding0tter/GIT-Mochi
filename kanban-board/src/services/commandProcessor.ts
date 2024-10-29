import { setCommandInputValue, setLoading } from "../stores/uiStore";
import {
  Command,
  commandStore,
  getActiveDropdownValue,
  resetCommandline,
  setActiveDropdownIndex,
  setPendingCommand,
  setWaitingForInput,
} from "../stores/commandStore";
import { getCommandByAction } from "../commands/commandRegistry";
import { closeModalAndUnfocus } from "./uiService";

export const useCommandProcessor = () => {
  const handleCommandAsync = async () => {
    setLoading(true);

    try {
      if (commandStore.waitingForInput) {
        await executePendingCommand();
      } else {
        const command = getSelectedCommand();
        if (!command) {
          throw new Error("No command found");
        }

        if (command.createOptions) await command.createOptions();

        await executeCommandFlow(command);
      }
    } catch (error) {
      resetCommandline();
      closeModalAndUnfocus();
    } finally {
      setLoading(false);
      setActiveDropdownIndex(0);
    }
  };

  const executeCommandFlow = async (command: Command) => {
    const currentCommand = { ...command };

    if (currentCommand.beforeAction && !commandStore.pendingCommand) {
      const beforeCommand = getCommandByAction(currentCommand.beforeAction);
      if (!beforeCommand) throw new Error("No before command found");

      setPendingCommand(currentCommand);
      await beforeCommand.execute();
      setCommandInputValue("");
      setWaitingForInput(true);
      return;
    }

    await currentCommand.execute();
    setCommandInputValue("");

    if (currentCommand.nextAction) {
      const nextCommand = getCommandByAction(currentCommand.nextAction);
      if (!nextCommand) throw new Error("No next command found");

      setPendingCommand(nextCommand);
      if (nextCommand.createOptions) await nextCommand.createOptions();
      setWaitingForInput(true);
    } else {
      setPendingCommand(undefined);
    }
  };

  const executePendingCommand = async () => {
    if (!commandStore.pendingCommand) {
      throw new Error("No pending command found");
    }

    await executeCommandFlow(commandStore.pendingCommand!);
    setWaitingForInput(false);
  };

  const getSelectedCommand = (): Command | undefined => {
    if (commandStore.pendingCommand) return commandStore.pendingCommand;

    const dropdownValue = getActiveDropdownValue();
    if (dropdownValue.value) return getCommandByAction(dropdownValue.value);

    return undefined;
  };

  return {
    handleCommandAsync,
    resetPendingCommand: () => setPendingCommand(undefined),
  };
};
