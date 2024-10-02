import { describe, expect, test } from "bun:test";
import {
  setActiveDropdownIndex,
  setBuffer,
  setDropdownValues,
} from "../../stores/commandStore";
import { AxiosResponse } from "axios";
import { useSpies } from "../../../base.test";

enum Choice {
  Yes,
  No,
}

const setup = (choice: Choice) => {
  setDropdownValues([
    {
      text: "Yes",
      value: "yes",
    },
    {
      text: "No",
      value: "no",
    },
  ]);
  setActiveDropdownIndex(choice);
};

describe("SetNewProjectAsCurrent Command", () => {
  test("should set new project as current", async () => {
    setBuffer("newProject");
    setup(Choice.Yes);

    const {
      setProjectAsyncSpy,
      getProjectAsyncSpy,
      fetchTasksAsyncSpy,
      resetCommandlineSpy,
      addNotificationSpy,
      setCurrentProjectSpy,
      closeModalAndUnfocusSpy,
    } = useSpies();

    setProjectAsyncSpy.mockImplementationOnce(async (projectId: string) => {
      return {} as AxiosResponse;
    });

    getProjectAsyncSpy.mockImplementationOnce(async () => {
      return {};
    });

    fetchTasksAsyncSpy.mockImplementationOnce(async () => {
      return [];
    });

    const { execute } = require("../setNewProjectAsCurrent");
    await execute();

    expect(setProjectAsyncSpy).toHaveBeenCalledWith(
      "custom_project/newProject"
    );
    expect(setCurrentProjectSpy).toHaveBeenCalled();
    expect(fetchTasksAsyncSpy).toHaveBeenCalled();
    expect(addNotificationSpy).toHaveBeenCalledWith({
      title: "Success",
      description: "Project set successfully",
      type: "success",
    });
    expect(resetCommandlineSpy).toHaveBeenCalled();
    expect(closeModalAndUnfocusSpy).toHaveBeenCalled();
  });

  test("should not set new project as current", async () => {
    setup(Choice.No);
    const {
      setProjectAsyncSpy,
      fetchTasksAsyncSpy,
      resetCommandlineSpy,
      addNotificationSpy,
      setCurrentProjectSpy,
      closeModalAndUnfocusSpy,
    } = useSpies();

    const { execute } = require("../setNewProjectAsCurrent");
    await execute();

    expect(setProjectAsyncSpy).not.toHaveBeenCalled();
    expect(setCurrentProjectSpy).not.toHaveBeenCalled();
    expect(fetchTasksAsyncSpy).not.toHaveBeenCalled();
    expect(addNotificationSpy).not.toHaveBeenCalled();

    expect(resetCommandlineSpy).toHaveBeenCalled();
    expect(closeModalAndUnfocusSpy).toHaveBeenCalled();
  });
});

describe("setNewProjectAsCurrent createOptions", () => {
  test("should set dropdown values", async () => {
    const { createOptions } = require("../setNewProjectAsCurrent");
    const { setCommandPlaceholderSpy } = useSpies();
    await createOptions();

    expect(setCommandPlaceholderSpy).toHaveBeenCalledWith(
      "Do you want to set the new project as current?"
    );
    expect(setDropdownValues).toHaveBeenCalledWith([
      { text: "Yes", value: "yes" },
      { text: "No", value: "no" },
    ]);
  });
});
