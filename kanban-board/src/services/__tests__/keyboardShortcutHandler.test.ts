import { describe, expect, test } from "bun:test";
import { handleKeyDown } from "../keyboardShortcutHandler";
import { useSpies } from "../../../base.test";
import { InputMode, setInputMode } from "../../stores/uiStore";
import { ModalType, setActiveModal } from "../../stores/modalStore";
import { Direction } from "../taskNavigationService";

const getKeyboardEvent = (
  key: string,
  ctrlKey: boolean = false,
  shiftKey: boolean = false
) => {
  return {
    key,
    ctrlKey,
    shiftKey,
    preventDefault: () => {},
    stopPropagation: () => {},
  } as KeyboardEvent;
};

describe("KeyboardShortcutHandler", () => {
  test("should close and unfocus on escape", () => {
    const event = getKeyboardEvent("Escape");

    const { closeModalAndUnfocusSpy } = useSpies();

    handleKeyDown(event);

    expect(closeModalAndUnfocusSpy).toHaveBeenCalled();
  });

  test("should reset commandline when in commandline inputMode", () => {
    const event = getKeyboardEvent("Escape");

    const { resetCommandlineSpy, closeModalAndUnfocusSpy } = useSpies();

    setInputMode(InputMode.Commandline);

    handleKeyDown(event);

    expect(closeModalAndUnfocusSpy).toHaveBeenCalled();
    expect(resetCommandlineSpy).toHaveBeenCalled();
  });

  test("should do nothing if focus is on input", () => {
    const inputTypes = ["INPUT", "TEXTAREA", "SELECT"];

    const { setActiveModalSpy } = useSpies();

    const event = getKeyboardEvent("h");

    for (const inputType of inputTypes) {
      global.document = Object.create({
        activeElement: {
          tagName: inputType,
        },
      });

      handleKeyDown(event);
      expect(setActiveModalSpy).not.toHaveBeenCalled();
    }
  });

  test("should do nothing if modal is open", () => {
    const { setActiveModalSpy } = useSpies();

    const event = getKeyboardEvent("c");

    setActiveModal(ModalType.Help);

    handleKeyDown(event);
    expect(setActiveModalSpy).not.toHaveBeenCalledWith(ModalType.CreateTask);
  });

  test("should focus commandline on ctrl+p", () => {
    const event = getKeyboardEvent("p", true);

    const { focusInputSpy } = useSpies();

    handleKeyDown(event);

    expect(focusInputSpy).toHaveBeenCalled();
  });

  test("should focus search on ctrl+f", () => {
    const event = getKeyboardEvent("f", true);

    const { focusInputSpy } = useSpies();

    handleKeyDown(event);

    expect(focusInputSpy).toHaveBeenCalled();
  });

  test("should move tasks left on shift+left", async () => {
    const event = getKeyboardEvent("ArrowLeft", false, true);

    const { moveSelectedTasksAsyncSpy } = useSpies();

    await handleKeyDown(event);

    expect(moveSelectedTasksAsyncSpy).toHaveBeenCalledWith(Direction.Left);
  });

  test("should move tasks left on shift+a", async () => {
    const event = getKeyboardEvent("A", false, true);

    const { moveSelectedTasksAsyncSpy } = useSpies();

    await handleKeyDown(event);

    expect(moveSelectedTasksAsyncSpy).toHaveBeenCalledWith(Direction.Left);
  });

  test("should move tasks right on shift+right", async () => {
    const event = getKeyboardEvent("ArrowRight", false, true);

    const { moveSelectedTasksAsyncSpy } = useSpies();

    await handleKeyDown(event);

    expect(moveSelectedTasksAsyncSpy).toHaveBeenCalledWith(Direction.Right);
  });

  test("should move tasks right on shift+d", async () => {
    const event = getKeyboardEvent("D", false, true);

    const { moveSelectedTasksAsyncSpy } = useSpies();

    await handleKeyDown(event);

    expect(moveSelectedTasksAsyncSpy).toHaveBeenCalledWith(Direction.Right);
  });
});
