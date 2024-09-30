import { describe, expect, test } from "bun:test";

describe("CommandRegistry", () => {
  test("register command should add command to registry", () => {
    const {
      registerCommand,
      getRegisteredCommands,
    } = require("../commandRegistry");

    const testCommand = {
      text: "test-command",
      description: "test",
      action: "test-command",
      display: true,
      execute: async () => {},
    };

    registerCommand(testCommand);

    const commands = getRegisteredCommands();

    expect(commands).toHaveLength(1);
  });

  test("get command by action should return command", () => {
    const {
      registerCommand,
      getCommandByAction,
    } = require("../commandRegistry");

    const testCommand = {
      text: "test-command",
      description: "test",
      action: "test-command",
      display: true,
      execute: async () => {},
    };

    registerCommand(testCommand);

    const command = getCommandByAction("test-command");

    expect(command).toEqual(testCommand);
  });

  test("reset command registry should clear registry", () => {
    const {
      registerCommand,
      resetCommandRegistry,
      getRegisteredCommands,
    } = require("../commandRegistry");

    const testCommand = {
      text: "test-command",
      description: "test",
      action: "test-command",
      display: true,
      execute: async () => {},
    };

    registerCommand(testCommand);

    resetCommandRegistry();

    const commands = getRegisteredCommands();

    expect(commands).toHaveLength(0);
  });
});
