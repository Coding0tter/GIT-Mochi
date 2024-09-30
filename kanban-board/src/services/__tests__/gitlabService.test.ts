import { beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import {
  createMergeRequestAndBranchAsync,
  createMergeRequestAndBranchForSelectedTaskAsync,
  loadGitLabProjectsAsync,
  openSelectedTaskLink,
  syncGitlabAsync,
} from "../gitlabService";
import axios from "axios";
import { useSpies } from "../../../base.test";
import { Task } from "../../stores/taskStore";

beforeEach(() => {
  global.window = Object.create({
    open: () => {},
  });
});

describe("GitLabService", () => {
  test("syncGitlabAsync should sync gitlab", async () => {
    const axiosPostSpy = spyOn(axios, "post").mockResolvedValue({
      status: 200,
    });

    const { fetchTasksAsyncSpy, setLoadingSpy, addNotificationSpy } =
      useSpies();

    await syncGitlabAsync();

    expect(setLoadingSpy).toHaveBeenCalledWith(true);
    expect(axiosPostSpy).toHaveBeenCalledWith(`/git/sync`);

    expect(fetchTasksAsyncSpy).toHaveBeenCalled();

    expect(addNotificationSpy).toHaveBeenCalledWith({
      title: "Synced with GitLab",
      description: "Tasks have been synced with GitLab",
      type: "success",
    });
    expect(setLoadingSpy).toHaveBeenCalledWith(false);
  });

  test("syncGitlabAsync should show error notification if failed to sync", async () => {
    const axiosPostSpy = spyOn(axios, "post").mockResolvedValue({
      status: 500,
    });

    const { addNotificationSpy, setLoadingSpy } = useSpies();

    await syncGitlabAsync();

    expect(setLoadingSpy).toHaveBeenCalledWith(true);
    expect(axiosPostSpy).toHaveBeenCalledWith(`/git/sync`);

    expect(addNotificationSpy).toHaveBeenCalledWith({
      title: "Error",
      description: "Failed to sync with GitLab",
      type: "error",
    });
    expect(setLoadingSpy).toHaveBeenCalledWith(false);
  });

  test("openSelectedTaskLink should openLink", () => {
    const mockOpen = mock();
    const { getColumnTasksSpy } = useSpies();

    getColumnTasksSpy.mockReturnValue([{ web_url: "test" } as Task]);

    global.window = Object.create({
      open: () => {
        mockOpen();
      },
    });
    openSelectedTaskLink();

    expect(getColumnTasksSpy).toHaveBeenCalled();
    expect(mockOpen).toHaveBeenCalled();
  });

  test("createMergeRequestAndBranchForSelectedTaskAsync should create merge request and branch", async () => {
    const { getColumnTasksSpy, createMergeRequestAndBranchAsyncSpy } =
      useSpies();

    getColumnTasksSpy.mockReturnValue([
      { type: "issue", gitlabIid: "1" } as Task,
    ]);

    createMergeRequestAndBranchAsyncSpy.mockResolvedValue({
      branch: { name: "1" },
      mergeRequest: { title: "1" },
    });

    const { addNotificationSpy } = useSpies();

    await createMergeRequestAndBranchForSelectedTaskAsync();

    expect(getColumnTasksSpy).toHaveBeenCalled();
    expect(createMergeRequestAndBranchAsyncSpy).toHaveBeenCalledWith("1");
    expect(addNotificationSpy).toHaveBeenCalledWith({
      title: "Branch created",
      description: `Created branch 1`,
      type: "success",
    });
    expect(addNotificationSpy).toHaveBeenCalledWith({
      title: "Merge request created",
      description: `Created merge request 1`,
      type: "success",
    });
  });

  test("createMergeRequestAndBranchForSelectedTaskAsync should show error notification if failed to create branch", async () => {
    const { getColumnTasksSpy, createMergeRequestAndBranchAsyncSpy } =
      useSpies();

    getColumnTasksSpy.mockReturnValue([
      { type: "issue", gitlabIid: "1" } as Task,
    ]);

    createMergeRequestAndBranchAsyncSpy.mockResolvedValue({
      branch: { error: "error" },
      mergeRequest: { title: "1" },
    });

    const { addNotificationSpy } = useSpies();

    await createMergeRequestAndBranchForSelectedTaskAsync();

    expect(getColumnTasksSpy).toHaveBeenCalled();
    expect(createMergeRequestAndBranchAsyncSpy).toHaveBeenCalledWith("1");
    expect(addNotificationSpy).toHaveBeenCalledWith({
      title: "Error",
      description: "error",
      type: "error",
    });
  });

  test("createMergeRequestAndBranchForSelectedTaskAsync should show error notification if failed to create merge request", async () => {
    const { getColumnTasksSpy, createMergeRequestAndBranchAsyncSpy } =
      useSpies();

    getColumnTasksSpy.mockReturnValue([
      { type: "issue", gitlabIid: "1" } as Task,
    ]);

    createMergeRequestAndBranchAsyncSpy.mockResolvedValue({
      branch: { name: "1" },
      mergeRequest: { error: "error" },
    });

    const { addNotificationSpy } = useSpies();

    await createMergeRequestAndBranchForSelectedTaskAsync();

    expect(getColumnTasksSpy).toHaveBeenCalled();
    expect(createMergeRequestAndBranchAsyncSpy).toHaveBeenCalledWith("1");
    expect(addNotificationSpy).toHaveBeenCalledWith({
      title: "Error",
      description: "error",
      type: "error",
    });
  });

  test("createMergeRequestAndBranchForSelectedTaskAsync should not create merge request and branch if task is not issue", async () => {
    const { getColumnTasksSpy } = useSpies();

    getColumnTasksSpy.mockReturnValue([{ type: "merge_request" } as Task]);

    const { createMergeRequestAndBranchAsyncSpy, addNotificationSpy } =
      useSpies();

    await createMergeRequestAndBranchForSelectedTaskAsync();

    expect(getColumnTasksSpy).toHaveBeenCalled();
    expect(createMergeRequestAndBranchAsyncSpy).not.toHaveBeenCalled();
    expect(addNotificationSpy).toHaveBeenCalledWith({
      title: "Warning",
      description: "Only issues can be converted to merge requests",
      type: "warning",
    });
  });

  test("loadGitLabProjectsAsync should load gitlab projects", async () => {
    const axiosGetSpy = spyOn(axios, "get").mockResolvedValue({
      data: [{ id: "projectId", name_with_namespace: "project" }],
    });

    const projects = await loadGitLabProjectsAsync();

    expect(axiosGetSpy).toHaveBeenCalledWith("/git/projects");

    expect(projects).toEqual([
      { id: "projectId", name: "project", name_with_namespace: "project" },
    ]);
  });

  test("loadGitLabProjectsAsync should do nothing if failed to load projects", async () => {
    const axiosGetSpy = spyOn(axios, "get").mockRejectedValue(
      new Error("Failed to load projects")
    );

    const projects = await loadGitLabProjectsAsync();

    expect(axiosGetSpy).toHaveBeenCalledWith("/git/projects");

    expect(projects).toEqual([]);
  });

  test("createMergeRequestAndBranchAsync should make call to backend", async () => {
    const axiosPostSpy = spyOn(axios, "post").mockResolvedValue({
      status: 200,
      data: { branch: { name: "1" }, mergeRequest: { title: "1" } },
    });

    const { branch, mergeRequest } = await createMergeRequestAndBranchAsync(
      "1"
    );

    expect(axiosPostSpy).toHaveBeenCalledWith("/git/create-merge-request", {
      issueId: "1",
    });

    expect(branch).toEqual({ name: "1" });
    expect(mergeRequest).toEqual({ title: "1" });
  });

  test("createMergeRequestAndBranchAsync should throw error if failed to create merge request", async () => {
    const axiosPostSpy = spyOn(axios, "post").mockResolvedValue({
      status: 500,
    });

    expect(createMergeRequestAndBranchAsync("1")).rejects.toThrow(
      "Failed to create merge request"
    );

    expect(axiosPostSpy).toHaveBeenCalledWith("/git/create-merge-request", {
      issueId: "1",
    });
  });
});
