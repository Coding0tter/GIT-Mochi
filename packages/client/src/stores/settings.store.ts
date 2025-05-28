import axios from "axios";
import { createStore } from "solid-js/store";

export const [settingsStore, setSettingsStore] = createStore({
  gitlab_url: "",
});

export const getGitlabUrl = async () => {
  const res = await axios.get(`/settings/gitlab-url`);
  const response = res.data;

  setSettingsStore("gitlab_url", response);
};
