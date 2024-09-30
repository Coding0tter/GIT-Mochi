import { afterEach, describe, expect, mock, test } from "bun:test";
import {
  commandStore,
  resetCommandline,
  setActiveDropdownIndex,
  setDropdownValues,
  setPendingCommand,
  setWaitingForInput,
} from "../../stores/commandStore";
import { registerCommand } from "../../commands/commandRegistry";
import { setCommandInputValue, setLoading } from "../../stores/uiStore";
import { closeModalAndUnfocus } from "../uiService";
import { useSpies } from "../../../base.test";

mock.module("solid-js", () => ({
  createSignal: mock(),
}));

afterEach(() => {
  setPendingCommand(undefined);
  setWaitingForInput(false);
});

describe("CommandProcessor", () => {
  test("resetPendingCommand should reset pending command", () => {
    const { useCommandProcessor } = require("../commandProcessor");
    const { resetPendingCommand } = useCommandProcessor();
    const { setPendingCommandSpy } = useSpies();

    resetPendingCommand();

    expect(setPendingCommandSpy).toHaveBeenCalledWith(undefined);
  });

  test("handleCommandAsync should execute command flow", async () => {
    const { setCommandInputValueSpy } = useSpies();

    const commandFunction = mock();

    const testCommand = {
      text: "test-command",
      description: "test",
      action: "test-command",
      display: true,
      execute: async () => {
        commandFunction();
      },
    };

    registerCommand(testCommand);

    const { useCommandProcessor } = require("../commandProcessor");
    const { handleCommandAsync } = useCommandProcessor();

    setDropdownValues([{ text: "test", value: "test-command" }]);
    setActiveDropdownIndex(0);

    await handleCommandAsync();

    expect(commandFunction).toHaveBeenCalled();
    expect(setCommandInputValueSpy).toHaveBeenCalledWith("");
  });

  test("handleCommandAsync should call beforeAction command", async () => {
    const beforeCommandFunction = mock();
    const commandFunction = mock();

    const beforeCommand = {
      text: "before",
      description: "before",
      action: "before",
      display: false,
      execute: async () => {
        beforeCommandFunction();
      },
    };

    const testCommand = {
      text: "test-before",
      description: "test",
      action: "test-before",
      display: true,
      beforeAction: "before",
      execute: async () => {
        commandFunction();
      },
    };

    registerCommand(beforeCommand);
    registerCommand(testCommand);

    const { useCommandProcessor } = require("../commandProcessor");
    const { handleCommandAsync } = useCommandProcessor();

    setDropdownValues([{ text: "test", value: "test-before" }]);
    setActiveDropdownIndex(0);

    await handleCommandAsync();

    expect(beforeCommandFunction).toHaveBeenCalled();
  });

  test("handleCommandAsync should call nextAction command", async () => {
    const nextCommandFunction = mock();
    const commandFunction = mock();
    const createOptionsFunction = mock();

    const nextCommand = {
      text: "next",
      description: "next",
      action: "next",
      display: false,
      execute: async () => {
        nextCommandFunction();
      },
      createOptions: async () => {
        createOptionsFunction();
      },
    };

    const testCommand = {
      text: "test-next",
      description: "test",
      action: "test-next",
      display: true,
      nextAction: "next",
      execute: async () => {
        commandFunction();
      },
    };

    registerCommand(nextCommand);
    registerCommand(testCommand);

    const { useCommandProcessor } = require("../commandProcessor");
    const { handleCommandAsync } = useCommandProcessor();
    const { setCommandInputValueSpy } = useSpies();

    setDropdownValues([{ text: "test", value: "test-next" }]);
    setActiveDropdownIndex(0);

    await handleCommandAsync();

    expect(commandFunction).toHaveBeenCalled();
    expect(setCommandInputValueSpy).toHaveBeenCalledWith("");

    expect(setPendingCommand).toHaveBeenCalledWith(nextCommand);
    expect(createOptionsFunction).toHaveBeenCalled();

    await handleCommandAsync();

    expect(nextCommandFunction).toHaveBeenCalled();
    expect(setCommandInputValue).toHaveBeenCalledWith("");
  });

  test("handleCommandAsync should execute pending command when waiting for input", async () => {
    const commandFunction = mock();

    setWaitingForInput(true);
    setPendingCommand({
      text: "pending",
      description: "pending",
      action: "pending",
      display: false,
      execute: async () => {
        commandFunction();
      },
    });

    const { useCommandProcessor } = require("../commandProcessor");
    const { handleCommandAsync } = useCommandProcessor();
    const { setWaitingForInputSpy } = useSpies();

    await handleCommandAsync();

    expect(commandFunction).toHaveBeenCalled();
    expect(setWaitingForInputSpy).toHaveBeenCalledWith(false);
  });

  test("handleCommandAsync should throw error if no command found", async () => {
    const { useCommandProcessor } = require("../commandProcessor");
    const { handleCommandAsync } = useCommandProcessor();
    const { resetCommandlineSpy } = useSpies();

    setDropdownValues([{ text: "test", value: "no-command" }]);
    setActiveDropdownIndex(0);

    await handleCommandAsync();

    expect(resetCommandlineSpy).toHaveBeenCalled();
    expect(closeModalAndUnfocus).toHaveBeenCalled();

    expect(setLoading).toHaveBeenCalledWith(false);
    expect(setActiveDropdownIndex).toHaveBeenCalledWith(0);
  });

  test("handleCommandAsync should throw error if no pending command found and waiting for input", async () => {
    const { useCommandProcessor } = require("../commandProcessor");
    const { handleCommandAsync } = useCommandProcessor();
    const { resetCommandlineSpy } = useSpies();

    setDropdownValues([{ text: "test", value: "no-command" }]);
    setActiveDropdownIndex(0);
    setWaitingForInput(true);

    await handleCommandAsync();

    expect(resetCommandlineSpy).toHaveBeenCalled();
    expect(closeModalAndUnfocus).toHaveBeenCalled();

    expect(setLoading).toHaveBeenCalledWith(false);
    expect(setActiveDropdownIndex).toHaveBeenCalledWith(0);
  });
});
