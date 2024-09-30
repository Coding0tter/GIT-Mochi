import { describe, expect, mock, spyOn, test } from "bun:test";
import {
  createProjectAsync,
  getProjectAsync,
  loadCustomProjectsAsync,
  setProjectAsync,
} from "../customProjectService";
import axios, { AxiosError } from "axios";
import { addNotification } from "../notificationService";
import { useSpies } from "../../../base.test";

describe("CustomProjectService", () => {
  test("createProjectAsync should create project", async () => {
    const axiosPostSpy = spyOn(axios, "post").mockResolvedValue({
      status: 200,
      data: {},
    });
    const { addNotificationSpy } = useSpies();

    await createProjectAsync("test-project");

    expect(axiosPostSpy).toHaveBeenCalledWith("/projects", {
      name: "test-project",
    });

    expect(addNotificationSpy).toHaveBeenCalledWith({
      title: "Project created",
      description: "Project test-project has been created",
      type: "success",
    });

    axiosPostSpy.mockClear();
  });

  test("createProjectAsync should show error notification if failed to create project", async () => {
    const axiosPostSpy = spyOn(axios, "post").mockRejectedValue(
      new AxiosError("Failed to create project")
    );

    const { addNotificationSpy } = useSpies();

    await createProjectAsync("test-project");

    expect(axiosPostSpy).toHaveBeenCalledWith("/projects", {
      name: "test-project",
    });

    expect(addNotificationSpy).toHaveBeenCalledWith({
      title: "Error",
      description: "Failed to create project",
      type: "error",
    });
  });

  test("loadCustomProjectsAsync should load custom projects", async () => {
    const axiosGetSpy = spyOn(axios, "get").mockResolvedValue({
      data: [{ _id: "projectId", name: "project" }],
    });

    const { addNotificationSpy } = useSpies();

    const projects = await loadCustomProjectsAsync();

    expect(axiosGetSpy).toHaveBeenCalledWith("/projects");

    expect(projects).toEqual([
      { _id: "projectId", name: "project", custom: true, id: "projectId" },
    ]);

    expect(addNotificationSpy).not.toHaveBeenCalled();
  });

  test("loadCustomProjectsAsync should show error notification if failed to load custom projects", async () => {
    const axiosGetSpy = spyOn(axios, "get").mockRejectedValue(
      new AxiosError("Failed to load projects")
    );

    const { addNotificationSpy } = useSpies();

    const projects = await loadCustomProjectsAsync();

    expect(axiosGetSpy).toHaveBeenCalledWith("/projects");

    expect(projects).toEqual([]);

    expect(addNotificationSpy).toHaveBeenCalledWith({
      title: "Error",
      description: "Failed to load projects",
      type: "error",
    });
  });

  test("loadCustomProjectsAsync should show error notification if failed to load projects", async () => {
    const axiosGetSpy = spyOn(axios, "get").mockRejectedValue(
      new AxiosError("Failed to load projects")
    );

    const { addNotificationSpy } = useSpies();

    const projects = await loadCustomProjectsAsync();

    expect(axiosGetSpy).toHaveBeenCalledWith("/projects");

    expect(projects).toEqual([]);

    expect(addNotificationSpy).toHaveBeenCalledWith({
      title: "Error",
      description: "Failed to load projects",
      type: "error",
    });
  });

  test("setProjectAsync should set project", async () => {
    const axiosPatchSpy = spyOn(axios, "patch").mockResolvedValue({
      status: 200,
    });

    await setProjectAsync("projectId");

    expect(axiosPatchSpy).toHaveBeenCalledWith("/projects", {
      projectId: "projectId",
    });
  });

  test("setProjectAsync should show error notification if failed to set project", async () => {
    const axiosPatchSpy = spyOn(axios, "patch").mockRejectedValue(
      new AxiosError("Failed to set project")
    );

    await setProjectAsync("projectId");

    expect(axiosPatchSpy).toHaveBeenCalledWith("/projects", {
      projectId: "projectId",
    });
  });

  test("getProjectAsync should return current project", async () => {
    const axiosGetSpy = spyOn(axios, "get").mockResolvedValue({
      data: { name: "project" },
    });

    const project = await getProjectAsync();

    expect(axiosGetSpy).toHaveBeenCalledWith("/projects/current");

    expect(project).toEqual({ name: "project" });
  });

  test("getProjectAsync should show error notification if failed to get project", async () => {
    const axiosGetSpy = spyOn(axios, "get").mockRejectedValue(
      new AxiosError("Failed to get project")
    );

    const project = await getProjectAsync();

    expect(axiosGetSpy).toHaveBeenCalledWith("/projects/current");

    expect(project).toBeNull();
  });
});
