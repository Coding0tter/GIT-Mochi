import { describe, expect, test } from "bun:test";
import {
  resetCommandline,
  setActiveDropdownIndex,
  setDropdownValues,
} from "../../stores/commandStore";
import {
  addNotificationSpy,
  getProjectAsyncSpy,
  handleGitlabSyncAsyncSpy,
  resetCommandlineSpy,
  setCurrentProjectSpy,
  setProjectAsyncSpy,
} from "../../../base.test";
import { AxiosResponse } from "axios";
import { Project } from "../../stores/uiStore";
import { closeModalAndUnfocus } from "../../services/uiService";

describe("setProject execute", () => {
  test("should set gitlab project ", async () => {
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

    setProjectAsyncSpy.mockImplementationOnce(async (projectId: string) => {
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
    expect(setCurrentProjectSpy).toHaveBeenCalledWith(expectedProject);

    expect(addNotificationSpy).toHaveBeenCalledWith({
      title: "Success",
      description: "Project set successfully",
      type: "success",
    });

    expect(resetCommandline).toHaveBeenCalled();
    expect(closeModalAndUnfocus).toHaveBeenCalled();
  });
});
