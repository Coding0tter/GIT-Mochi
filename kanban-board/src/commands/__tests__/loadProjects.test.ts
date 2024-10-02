import { describe, expect, test } from "bun:test";
import { setDropdownValues } from "../../stores/commandStore";
import { useSpies } from "../../../base.test";
import { loadGitLabProjectsAsync } from "../../services/gitlabService";
import { loadCustomProjectsAsync } from "../../services/customProjectService";
import { addNotification } from "../../services/notificationService";

describe("LoadProjects Command", () => {
  test("should load projects and set dropdown values", async () => {
    const gitlabProjects = [
      { id: "gitlabProjectId", custom: false, name: "gitlabProject" },
    ];
    const customProjects = [
      { _id: "customProjectId", custom: true, name: "customProject" },
    ];

    const {
      loadCustomProjectsAsyncSpy,
      loadGitLabProjectsAsyncSpy,
      setCommandInputValueSpy,
    } = useSpies();

    loadGitLabProjectsAsyncSpy.mockImplementationOnce(async () => {
      return gitlabProjects;
    });

    loadCustomProjectsAsyncSpy.mockImplementationOnce(async () => {
      return customProjects;
    });

    const { execute } = require("../loadProjects");
    await execute();

    expect(loadGitLabProjectsAsync).toHaveBeenCalled();
    expect(loadCustomProjectsAsync).toHaveBeenCalled();

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
    const { loadGitLabProjectsAsyncSpy } = useSpies();

    loadGitLabProjectsAsyncSpy.mockImplementationOnce(async () => {
      throw new Error("Failed to load projects");
    });

    const { execute } = require("../loadProjects");
    await execute();

    expect(addNotification).toHaveBeenCalledWith({
      title: "Error",
      description: "Failed to load projects",
      type: "error",
    });
  });
});
