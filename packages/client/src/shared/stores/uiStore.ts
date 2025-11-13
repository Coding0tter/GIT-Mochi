import { createBaseStore } from "@client/stores/baseStore";

interface UIState {
  syncing: boolean;
  loading: boolean;
}

const { store: uiStore, setStore: setUiStore } = createBaseStore<UIState>({
  syncing: false,
  loading: false,
});

export { uiStore };

export const setSyncing = (syncing: boolean) => {
  setUiStore({ syncing });
};

export const setLoading = (loading: boolean) => {
  setUiStore({ loading });
};
