import { setLoading, uiStore } from "../stores/uiStore";
import {
  Command,
  commandStore,
  DropdownValue,
  setActiveDropdownIndex,
  setCurrentCommand,
  setPendingCommand,
} from "../stores/commandStore";
import { COMMANDS } from "../commands";

export const useCommandProcessor = () => {
  const handleCommand = async (input: Partial<DropdownValue>) => {
    setLoading(true);

    let command;

    if (input === undefined) {
      command = commandStore.pendingCommand;
      if (!command) {
        throw new Error("No pending command found");
      }
      input = { value: uiStore.commandInputValue };
    } else {
      command = COMMANDS.find((cmd) => cmd.action === input.action);
    }

    if (!command) {
      throw new Error("Command not found");
    }

    try {
      if (command.beforeAction && !commandStore.pendingCommand) {
        const beforeCommand = COMMANDS.find(
          (cmd) => cmd.action === command.beforeAction
        );

        if (!beforeCommand) {
          throw new Error("Before command not found");
        }

        setPendingCommand(command as Command);
        setCurrentCommand(beforeCommand);

        await handleCommand({ action: beforeCommand.action! });

        return;
      }

      await command.execute(command, input.value);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setActiveDropdownIndex(0);
    }
  };

  return {
    handleCommand,
  };
};
