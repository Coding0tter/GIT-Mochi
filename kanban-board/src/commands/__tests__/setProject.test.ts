import { describe, expect, test } from "bun:test";
import {
  resetCommandline,
  setActiveDropdownIndex,
  setDropdownValues,
} from "../../stores/commandStore";
import { AxiosResponse } from "axios";
import { Project } from "../../stores/uiStore";
import { closeModalAndUnfocus } from "../../services/uiService";
import { useSpies } from "../../../base.test";

describe("SetProject Command", () => {
  test("should set custom project", async () => {
    const {
      setProjectAsyncSpy,
      fetchTasksAsyncSpy,
      getProjectAsyncSpy,
      setCurrentProjectSpy,
      addNotificationSpy,
    } = useSpies();

    setDropdownValues([
      {
        text: "customProject",
        value: { id: "customProjectId", custom: true, name: "customProject" },
      },
    ]);
    setActiveDropdownIndex(0);

    const expectedProject = {
      id: "customProjectId",
      custom: true,
      name: "customProject",
    };

    setProjectAsyncSpy.mockImplementationOnce(async (projectId: string) => {
      return {} as AxiosResponse;
    });

    fetchTasksAsyncSpy.mockImplementationOnce(async () => {
      return [];
    });
    getProjectAsyncSpy.mockImplementationOnce(async () => {
      return expectedProject;
    });
    setCurrentProjectSpy.mockImplementationOnce(
      async (_project: Project | null) => {}
    );

    const { execute } = require("../setProject");
    await execute();

    expect(setProjectAsyncSpy).toHaveBeenCalledWith(
      "custom_project/customProjectId"
    );
    expect(fetchTasksAsyncSpy).toHaveBeenCalled();
    expect(setCurrentProjectSpy).toHaveBeenCalledWith(expectedProject);

    expect(addNotificationSpy).toHaveBeenCalledWith({
      title: "Success",
      description: "Project set successfully",
      type: "success",
    });

    expect(resetCommandline).toHaveBeenCalled();
    expect(closeModalAndUnfocus).toHaveBeenCalled();
  });

  test("should set gitlab project ", async () => {
    const {
      setProjectAsyncSpy,
      fetchTasksAsyncSpy,
      getProjectAsyncSpy,
      setCurrentProjectSpy,
      addNotificationSpy,
      handleGitlabSyncAsyncSpy,
    } = useSpies();
    setDropdownValues([
      {
        text: "gitlabProject",
        value: { id: "gitlabProjectId", custom: false, name: "gitlabProject" },
      },
    ]);
    setActiveDropdownIndex(0);

    const expectedProject = {
      id: "gitlabProjectId",
      custom: false,
      name: "gitlabProject",
    };

    setProjectAsyncSpy.mockImplementationOnce(async (_projectId: string) => {
      return {} as AxiosResponse;
    });

    handleGitlabSyncAsyncSpy.mockImplementationOnce(async () => {});
    getProjectAsyncSpy.mockImplementationOnce(async () => {
      return expectedProject;
    });
    setCurrentProjectSpy.mockImplementationOnce(
      async (_project: Project | null) => {}
    );

    const { execute } = require("../setProject");
    await execute();

    expect(setProjectAsyncSpy).toHaveBeenCalledWith("gitlabProjectId");
    expect(handleGitlabSyncAsyncSpy).toHaveBeenCalled();
    expect(fetchTasksAsyncSpy).toHaveBeenCalled();
    expect(setCurrentProjectSpy).toHaveBeenCalledWith(expectedProject);

    expect(addNotificationSpy).toHaveBeenCalledWith({
      title: "Success",
      description: "Project set successfully",
      type: "success",
    });

    expect(resetCommandline).toHaveBeenCalled();
    expect(closeModalAndUnfocus).toHaveBeenCalled();
  });

  test("should show error notification", async () => {
    const { setProjectAsyncSpy, addNotificationSpy } = useSpies();
    setDropdownValues([
      {
        text: "gitlabProject",
        value: { id: "gitlabProjectId", custom: false, name: "gitlabProject" },
      },
    ]);
    setActiveDropdownIndex(0);

    setProjectAsyncSpy.mockImplementationOnce(async (_projectId: string) => {
      throw new Error();
    });

    const { execute } = require("../setProject");
    await execute();

    expect(addNotificationSpy).toHaveBeenCalledWith({
      title: "Error",
      description: "Failed to set project",
      type: "error",
    });

    expect(resetCommandline).toHaveBeenCalled();
    expect(closeModalAndUnfocus).toHaveBeenCalled();
  });
});
