import { describe, expect, mock, spyOn, test } from "bun:test";
import {
  createProjectAsync,
  getProjectAsync,
  loadCustomProjectsAsync,
  setProjectAsync,
} from "../customProjectService";
import axios, { AxiosError } from "axios";
import { useSpies } from "../../../base.test";

describe("CustomProjectService", () => {
  test("createProjectAsync should create project", async () => {
    const { addNotificationSpy, postSpy } = useSpies();
    postSpy.mockResolvedValue({
      status: 200,
      data: {},
    });

    await createProjectAsync("test-project");

    expect(postSpy).toHaveBeenCalledWith("/projects", {
      name: "test-project",
    });

    expect(addNotificationSpy).toHaveBeenCalledWith({
      title: "Project created",
      description: "Project test-project has been created",
      type: "success",
    });
  });

  test("createProjectAsync should show error notification if failed to create project", async () => {
    const { addNotificationSpy, postSpy } = useSpies();
    postSpy.mockRejectedValue(new AxiosError("Failed to create project"));

    await createProjectAsync("test-project");

    expect(postSpy).toHaveBeenCalledWith("/projects", {
      name: "test-project",
    });

    expect(addNotificationSpy).toHaveBeenCalledWith({
      title: "Error",
      description: "Failed to create project",
      type: "error",
    });
  });

  test("loadCustomProjectsAsync should load custom projects", async () => {
    const { getSpy, addNotificationSpy } = useSpies();
    getSpy.mockResolvedValue({
      data: [{ _id: "projectId", name: "project" }],
    });

    const projects = await loadCustomProjectsAsync();

    expect(getSpy).toHaveBeenCalledWith("/projects");

    expect(projects).toEqual([
      { _id: "projectId", name: "project", custom: true, id: "projectId" },
    ]);

    expect(addNotificationSpy).not.toHaveBeenCalled();
  });

  test("loadCustomProjectsAsync should show error notification if failed to load custom projects", async () => {
    const { getSpy, addNotificationSpy } = useSpies();

    getSpy.mockRejectedValue(new AxiosError("Failed to load projects"));

    const projects = await loadCustomProjectsAsync();

    expect(getSpy).toHaveBeenCalledWith("/projects");

    expect(projects).toEqual([]);

    expect(addNotificationSpy).toHaveBeenCalledWith({
      title: "Error",
      description: "Failed to load projects",
      type: "error",
    });
  });

  test("loadCustomProjectsAsync should show error notification if failed to load projects", async () => {
    const { getSpy, addNotificationSpy } = useSpies();

    getSpy.mockRejectedValue(new AxiosError("Failed to load projects"));

    const projects = await loadCustomProjectsAsync();

    expect(getSpy).toHaveBeenCalledWith("/projects");

    expect(projects).toEqual([]);

    expect(addNotificationSpy).toHaveBeenCalledWith({
      title: "Error",
      description: "Failed to load projects",
      type: "error",
    });
  });

  test("setProjectAsync should set project", async () => {
    const { patchSpy } = useSpies();

    await setProjectAsync("projectId");

    expect(patchSpy).toHaveBeenCalledWith("/projects", {
      projectId: "projectId",
    });
  });

  test("setProjectAsync should show error notification if failed to set project", async () => {
    const { patchSpy } = useSpies();
    patchSpy.mockRejectedValue(new AxiosError("Failed to set project"));

    await setProjectAsync("projectId");

    expect(patchSpy).toHaveBeenCalledWith("/projects", {
      projectId: "projectId",
    });
  });

  test("getProjectAsync should return current project", async () => {
    const { getSpy } = useSpies();

    getSpy.mockResolvedValue({
      data: { name: "project" },
    });

    const project = await getProjectAsync();

    expect(getSpy).toHaveBeenCalledWith("/projects/current");

    expect(project).toEqual({ name: "project" });
  });

  test("getProjectAsync should show error notification if failed to get project", async () => {
    const { getSpy } = useSpies();
    getSpy.mockRejectedValue(new AxiosError("Failed to get project"));

    const project = await getProjectAsync();

    expect(getSpy).toHaveBeenCalledWith("/projects/current");

    expect(project).toBeNull();
  });
});
