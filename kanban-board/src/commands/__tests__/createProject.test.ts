import { describe, expect, test } from "bun:test";
import { Project, setCommandInputValue } from "../../stores/uiStore";

import { setDropdownValues } from "../../stores/commandStore";
import { useSpies } from "../../../base.test";

const setupTest = (
  projectName: string,
  expectedProject: Partial<Project> | null
) => {
  setCommandInputValue(projectName);

  const { createProjectAsyncSpy } = useSpies();

  createProjectAsyncSpy.mockImplementationOnce(async () => {
    return expectedProject;
  });
};

describe("createProject execute", () => {
  test("should create project and set buffer", async () => {
    const projectName = "test-project";
    setupTest(projectName, { _id: "projectId" });
    const { createProjectAsyncSpy, setBufferSpy } = useSpies();

    const { execute } = require("../createProject");
    await execute();

    expect(createProjectAsyncSpy).toHaveBeenCalledWith(projectName);

    expect(setBufferSpy).toHaveBeenCalledWith("projectId");
  });

  test("should not set the buffer if the project is not created", async () => {
    const projectName = "test-project";
    setupTest(projectName, null);
    const { createProjectAsyncSpy, setBufferSpy } = useSpies();

    createProjectAsyncSpy.mockImplementationOnce(async () => {
      return null;
    });

    const { execute } = require("../createProject");
    await execute();

    expect(createProjectAsyncSpy).toHaveBeenCalledWith(projectName);

    expect(setBufferSpy).not.toHaveBeenCalled();
  });

  test("should not create project if the project name is empty", async () => {
    setCommandInputValue("");
    const { createProjectAsyncSpy, setBufferSpy } = useSpies();

    const { execute } = require("../createProject");
    await execute();

    expect(createProjectAsyncSpy).not.toHaveBeenCalled();
    expect(setBufferSpy).not.toHaveBeenCalled();
  });
});

describe("createProject createOptions", () => {
  test("should set placeholder and dropdown values", async () => {
    const { createOptions } = require("../createProject");
    const { setCommandPlaceholderSpy } = useSpies();

    await createOptions();

    expect(setCommandPlaceholderSpy).toHaveBeenCalledWith(
      "Enter a name for the new project"
    );
    expect(setDropdownValues).toHaveBeenCalledWith([
      {
        text: "Enter a name for the new project",
        showAlways: true,
      },
    ]);
  });
});
