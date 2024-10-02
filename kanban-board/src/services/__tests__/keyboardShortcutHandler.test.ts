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

  test("should add to selection on shift+up", async () => {
    const event = getKeyboardEvent("ArrowUp", false, true);

    const { addToSelectionSpy } = useSpies();

    await handleKeyDown(event);

    expect(addToSelectionSpy).toHaveBeenCalledWith(Direction.Up);
  });

  test("should add to selection on shift+down", async () => {
    const event = getKeyboardEvent("ArrowDown", false, true);

    const { addToSelectionSpy } = useSpies();

    await handleKeyDown(event);

    expect(addToSelectionSpy).toHaveBeenCalledWith(Direction.Down);
  });

  test("should sync gitlab on shift+s", async () => {
    const event = getKeyboardEvent("S", false, true);

    const { syncGitlabAsyncSpy } = useSpies();

    await handleKeyDown(event);

    expect(syncGitlabAsyncSpy).toHaveBeenCalled();
  });

  test("should open selected task link on shift+o", async () => {
    const event = getKeyboardEvent("O", false, true);

    const { openSelectedTaskLinkSpy } = useSpies();

    openSelectedTaskLinkSpy.mockImplementationOnce(() => {});

    await handleKeyDown(event);

    expect(openSelectedTaskLinkSpy).toHaveBeenCalled();
  });

  test("should create merge request and branch on shift+m", async () => {
    const event = getKeyboardEvent("M", false, true);

    const { createMergeRequestAndBranchForSelectedTaskAsyncSpy } = useSpies();

    createMergeRequestAndBranchForSelectedTaskAsyncSpy.mockImplementationOnce(
      async () => {}
    );

    await handleKeyDown(event);

    expect(
      createMergeRequestAndBranchForSelectedTaskAsyncSpy
    ).toHaveBeenCalled();
  });

  test("should restore selected task on shift+r", async () => {
    const event = getKeyboardEvent("R", false, true);

    const { restoreSelectedTaskAsyncSpy } = useSpies();

    restoreSelectedTaskAsyncSpy.mockImplementationOnce(async () => {});

    await handleKeyDown(event);

    expect(restoreSelectedTaskAsyncSpy).toHaveBeenCalled();
  });

  test("should moveSelection on w", async () => {
    const event = getKeyboardEvent("w");

    const { moveSelectionSpy } = useSpies();

    await handleKeyDown(event);

    expect(moveSelectionSpy).toHaveBeenCalledWith(Direction.Up);
  });

  test("should moveSelection on ArrowUp", async () => {
    const event = getKeyboardEvent("ArrowUp");

    const { moveSelectionSpy } = useSpies();

    await handleKeyDown(event);

    expect(moveSelectionSpy).toHaveBeenCalledWith(Direction.Up);
  });

  test("should moveSelection on s", async () => {
    const event = getKeyboardEvent("s");

    const { moveSelectionSpy } = useSpies();

    await handleKeyDown(event);

    expect(moveSelectionSpy).toHaveBeenCalledWith(Direction.Down);
  });

  test("should moveSelection on ArrowDown", async () => {
    const event = getKeyboardEvent("ArrowDown");

    const { moveSelectionSpy } = useSpies();

    await handleKeyDown(event);

    expect(moveSelectionSpy).toHaveBeenCalledWith(Direction.Down);
  });

  test("should moveSelection on a", async () => {
    const event = getKeyboardEvent("a");

    const { moveSelectionSpy } = useSpies();

    await handleKeyDown(event);

    expect(moveSelectionSpy).toHaveBeenCalledWith(Direction.Left);
  });

  test("should moveSelection on ArrowLeft", async () => {
    const event = getKeyboardEvent("ArrowLeft");

    const { moveSelectionSpy } = useSpies();

    await handleKeyDown(event);

    expect(moveSelectionSpy).toHaveBeenCalledWith(Direction.Left);
  });

  test("should moveSelection on d", async () => {
    const event = getKeyboardEvent("d");

    const { moveSelectionSpy } = useSpies();

    await handleKeyDown(event);

    expect(moveSelectionSpy).toHaveBeenCalledWith(Direction.Right);
  });

  test("should moveSelection on ArrowRight", async () => {
    const event = getKeyboardEvent("ArrowRight");

    const { moveSelectionSpy } = useSpies();

    await handleKeyDown(event);

    expect(moveSelectionSpy).toHaveBeenCalledWith(Direction.Right);
  });

  test("should move selected task on n", async () => {
    const event = getKeyboardEvent("n");

    const { moveSelectedTasksAsyncSpy } = useSpies();

    await handleKeyDown(event);

    expect(moveSelectedTasksAsyncSpy).toHaveBeenCalledWith(Direction.Right);
  });

  test("should move selected task on p", () => {
    const event = getKeyboardEvent("p");

    const { moveSelectedTasksAsyncSpy } = useSpies();

    handleKeyDown(event);

    expect(moveSelectedTasksAsyncSpy).toHaveBeenCalledWith(Direction.Left);
  });

  test("should open help modal on h", () => {
    const event = getKeyboardEvent("h");

    const { setActiveModalSpy } = useSpies();

    handleKeyDown(event);

    expect(setActiveModalSpy).toHaveBeenCalledWith(ModalType.Help);
  });

  test("should open delete modal on x", () => {
    const event = getKeyboardEvent("x");

    const { setActiveModalSpy } = useSpies();

    handleKeyDown(event);

    expect(setActiveModalSpy).toHaveBeenCalledWith(ModalType.DeleteTask);
  });

  test("should open create modal on c", () => {
    const event = getKeyboardEvent("c");

    const { setActiveModalSpy } = useSpies();

    handleKeyDown(event);

    expect(setActiveModalSpy).toHaveBeenCalledWith(ModalType.CreateTask);
  });

  test("should open edit modal on e", () => {
    const event = getKeyboardEvent("e");

    const { setActiveModalSpy } = useSpies();

    handleKeyDown(event);

    expect(setActiveModalSpy).toHaveBeenCalledWith(ModalType.CreateTask);
  });

  test("should open detail modal on o", () => {
    const event = getKeyboardEvent("o");

    const { setActiveModalSpy } = useSpies();

    handleKeyDown(event);

    expect(setActiveModalSpy).toHaveBeenCalledWith(ModalType.TaskDetails);
  });

  test("should toggle deleted tasks on v", () => {
    const event = getKeyboardEvent("v");

    const { toggleShowDeletedTasksAsyncSpy } = useSpies();

    handleKeyDown(event);

    expect(toggleShowDeletedTasksAsyncSpy).toHaveBeenCalled();
  });
});
