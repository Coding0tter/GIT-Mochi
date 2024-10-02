import { describe, expect, mock, test } from "bun:test";
import { InputMode, setCommandInputRef } from "../../stores/uiStore";
import { closeModalAndUnfocus, focusInput } from "../uiService";
import { useSpies } from "../../../base.test";

describe("UIService", () => {
  test("should call focus commandInputRef", async () => {
    const { setInputModeSpy } = useSpies();

    const focusMock = mock();
    const selectMock = mock();

    const commandInputRef = {
      select: selectMock,
      focus: focusMock,
    };

    setCommandInputRef(commandInputRef as any);

    focusInput(InputMode.Commandline);

    expect(setInputModeSpy).toHaveBeenCalledWith(InputMode.Commandline);

    await new Promise((resolve) => setTimeout(resolve, 1));

    expect(selectMock).toHaveBeenCalled();
    expect(focusMock).toHaveBeenCalled();
  });

  test("should do nothing if commandInputRef is null", async () => {
    const { setInputModeSpy } = useSpies();

    setCommandInputRef(null);

    focusInput(InputMode.Commandline);

    expect(setInputModeSpy).not.toHaveBeenCalled();
  });

  test("should close modal and blur input", async () => {
    const { handleCloseModalSpy } = useSpies();
    const blurMock = mock();

    global.document = {
      activeElement: {
        blur: blurMock,
      },
    } as any;

    closeModalAndUnfocus();

    expect(handleCloseModalSpy).toHaveBeenCalled();

    await new Promise((resolve) => setTimeout(resolve, 1));

    expect(blurMock).toHaveBeenCalled();
  });
});
