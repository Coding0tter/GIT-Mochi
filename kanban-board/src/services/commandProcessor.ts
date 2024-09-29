import { setCommandInputValue, setLoading } from "../stores/uiStore";
import {
  Command,
  commandStore,
  getActiveDropdownValue,
  resetCommandline,
  setActiveDropdownIndex,
  setWaitingForInput,
} from "../stores/commandStore";
import { getCommandByAction } from "../commands/commandRegistry";
import { closeModalAndUnfocus } from "./uiService";
import { createSignal } from "solid-js";

export const useCommandProcessor = () => {
  const [pendingCommand, setPendingCommand] = createSignal<Command | undefined>(
    undefined
  );

  const handleCommand = async () => {
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
      console.error(error);
      resetCommandline();
      closeModalAndUnfocus();
    } finally {
      setLoading(false);
      setActiveDropdownIndex(0);
    }
  };

  const executeCommandFlow = async (command: Command) => {
    if (command.beforeAction && !pendingCommand()) {
      const beforeCommand = getCommandByAction(command.beforeAction);
      if (!beforeCommand) throw new Error("No before command found");

      setPendingCommand(command);
      await beforeCommand.execute();
      setCommandInputValue("");
      setWaitingForInput(true);
      return;
    }

    await command.execute();
    setCommandInputValue("");

    if (command.nextAction) {
      const nextCommand = getCommandByAction(command.nextAction);
      if (!nextCommand) throw new Error("No next command found");

      setPendingCommand(nextCommand);
      if (nextCommand.createOptions) await nextCommand.createOptions();
      setWaitingForInput(true);
    } else {
      setPendingCommand(undefined);
    }
  };

  const executePendingCommand = async () => {
    if (!pendingCommand()) {
      throw new Error("No pending command found");
    }

    await executeCommandFlow(pendingCommand()!);
    setWaitingForInput(false);
  };

  const getSelectedCommand = (): Command | undefined => {
    if (pendingCommand()) return pendingCommand();

    const dropdownValue = getActiveDropdownValue();
    if (dropdownValue.value) return getCommandByAction(dropdownValue.value);

    return undefined;
  };

  return {
    handleCommand,
    resetPendingCommand: () => setPendingCommand(undefined),
  };
};
