import { settingsService } from "@client/services/settingsService";
import axios from "axios";
import { createStore } from "solid-js/store";

export const [settingsStore, setSettingsStore] = createStore({
  gitlab_url: "",
  labelOrder: [] as { label: string; order: number }[],
});

export const getLabelOrder = async () => {
  try {
    const labelOrder =
      await settingsService.getSettingByKey<{ label: string; order: number }[]>(
        "labelOrder",
      );
    if (labelOrder) {
      setSettingsStore("labelOrder", labelOrder);
    }
  } catch (error) {
    console.error("Failed to fetch label order:", error);
  }
};

export const getGitlabUrl = async () => {
  try {
    const res = await axios.get(`/settings/gitlab-url`);
    const response = res.data;

    setSettingsStore("gitlab_url", response);
  } catch (error) {
    console.error("Failed to fetch GitLab URL:", error);
  }
};
