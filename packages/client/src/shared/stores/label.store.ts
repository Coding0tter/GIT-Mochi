import { createBaseStore } from "@client/stores/baseStore.ts";
import { searchGitlabLabels as searchGitlabLabelsApi } from "@client/shared/services/label.service.ts";
import { LoadingTarget } from "@client/stores/uiStore.ts";
import type { GitlabLabel } from "shared/types/gitlab/label.ts";
import { projectStore } from "@client/shared/stores/project.store.ts";
import { addNotification } from "@client/services/notificationService.ts";
import {
  getSettingByKey,
  setSettingByKey,
} from "@client/shared/services/setting.service.ts";
import { SettingKeys } from "shared";

interface LabelState {
  labels: GitlabLabel[];
  columnLabels?: Record<string, GitlabLabel | null>;
}

const {
  store: labelStore,
  setStore: setLabelStore,
  run,
} = createBaseStore<LabelState>({
  labels: [],
});

export { labelStore };

export const searchGitlabLabels = async (search: string) => {
  await run(
    async () => {
      const project = projectStore.project;

      if (!project?.id) {
        addNotification({
          type: "warning",
          title: "No Project Selected",
        });

        return;
      }

      const labels = await searchGitlabLabelsApi(search, project.id);
      setLabelStore({ labels });

      return labels;
    },
    {
      action: "fetchLabels",
      loadingTarget: LoadingTarget.Labels,
    },
  );
};

export const fetchColumnLabels = async () => {
  return await run(async () => {
    const columnLabels = await getSettingByKey<
      Record<string, GitlabLabel | null>
    >(SettingKeys.COLUMN_LABELS);
    setLabelStore({ columnLabels: columnLabels || {} });
    return columnLabels;
  });
};

export const setColumnLabel = async (columnId: string, label: GitlabLabel) => {
  const updatedColumnLabels = {
    ...labelStore.columnLabels,
    [columnId]: label,
  };

  setLabelStore({ columnLabels: updatedColumnLabels });

  await run(
    async () => {
      await setSettingByKey(SettingKeys.COLUMN_LABELS, updatedColumnLabels);
      addNotification({
        type: "success",
        title: "Label Assigned",
        description: `Label "${label.name}" has been assigned to column "${columnId}".`,
      });
    },
    { showError: true },
  );
};

export const removeLabel = (columnId: string) => {
  if (!labelStore.columnLabels) return;

  const updatedColumnLabels = {
    ...labelStore.columnLabels,
    [columnId]: null,
  };

  setLabelStore({ columnLabels: updatedColumnLabels });
};
