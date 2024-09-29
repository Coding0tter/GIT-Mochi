import { describe, expect, test } from "bun:test";
import {
  addNotificationSpy,
  loadCustomProjectsAsyncSpy,
  loadGitLabProjectsAsyncSpy,
  setCommandInputValueSpy,
} from "../../../base.test";
import { setDropdownValues } from "../../stores/commandStore";

describe("loadProjects execute", () => {
  test("should load projects and set dropdown values", async () => {
    const gitlabProjects = [
      { id: "gitlabProjectId", custom: false, name: "gitlabProject" },
    ];
    const customProjects = [
      { _id: "customProjectId", custom: true, name: "customProject" },
    ];

    loadGitLabProjectsAsyncSpy.mockImplementationOnce(async () => {
      return gitlabProjects;
    });

    loadCustomProjectsAsyncSpy.mockImplementationOnce(async () => {
      return customProjects;
    });

    const { execute } = require("../loadProjects");
    await execute();

    expect(loadGitLabProjectsAsyncSpy).toHaveBeenCalled();
    expect(loadCustomProjectsAsyncSpy).toHaveBeenCalled();

    expect(setDropdownValues).toHaveBeenCalledWith([
      {
        text: "(custom) customProject",
        description: undefined,
        value: customProjects[0],
      },
      {
        text: "(gitlabProjectId): gitlabProject",
        description: undefined,
        value: gitlabProjects[0],
      },
    ]);

    expect(setCommandInputValueSpy).toHaveBeenCalledWith("");
  });

  test("should show error notification if failed to load projects", async () => {
    loadGitLabProjectsAsyncSpy.mockImplementationOnce(async () => {
      throw new Error("Failed to load projects");
    });

    const { execute } = require("../loadProjects");
    await execute();

    expect(addNotificationSpy).toHaveBeenCalledWith({
      title: "Error",
      description: "Failed to load projects",
      type: "error",
    });
  });
});
