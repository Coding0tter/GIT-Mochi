import { createBaseStore } from "@client/stores/baseStore.ts";
import { LoadingTarget } from "@client/stores/uiStore.ts";
import { searchGitlabProjects as searchGitlabProjectsApi } from "@client/shared/services/project.service.ts";
import type { GitlabProject } from "shared/types/gitlab/project.ts";
import {
  getUserSettingByKey,
  setUserSettingByKey,
} from "@client/shared/services/setting.service.ts";
import { addNotification } from "@client/services/notificationService.ts";
import { SettingKeys } from "shared";

interface ProjectState {
  projects: GitlabProject[];
  project?: GitlabProject;
}

const {
  store: projectStore,
  setStore: setProjectStore,
  run,
} = createBaseStore<ProjectState>({
  projects: [],
});

export { projectStore };

export const searchGitlabProjects = async (search: string) => {
  await run(
    async () => {
      const projects = await searchGitlabProjectsApi(search);
      setProjectStore({ projects });
      return projects;
    },
    {
      action: "fetchProjects",
      loadingTarget: LoadingTarget.Projects,
    },
  );
};

export const fetchCurrentProject = async () => {
  return await run(async () => {
    const project = await getUserSettingByKey<GitlabProject>(
      SettingKeys.CURRENT_PROJECT,
    );
    setProjectStore({ project: project as GitlabProject });

    return project;
  });
};

export const setSelectedProject = async (project: GitlabProject) => {
  setProjectStore({ project });

  await run(
    async () => {
      await setUserSettingByKey(SettingKeys.CURRENT_PROJECT, project);
      addNotification({
        type: "success",
        title: "Success",
        description: `Project "${project.name}" has been selected.`,
      });
    },
    {
      showError: true,
    },
  );
};
