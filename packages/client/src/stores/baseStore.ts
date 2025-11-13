import { addNotification } from "@client/services/notificationService.ts";
import { LoadingTarget, setUiStore } from "@client/stores/uiStore.ts";
import axios from "axios";
import { createStore } from "solid-js/store";

type AsyncMeta = {
  loading: boolean;
  errors: Record<string, string | null>;
};

type AsyncStore<T> = T & AsyncMeta;

export const createBaseStore = <T extends object>(initial: T) => {
  const [store, setStore] = createStore<AsyncStore<T>>({
    ...initial,
    loading: false,
    error: null,
    errors: {},
  });

  const run = async <R>(
    fn: () => Promise<R>,
    options?: {
      action?: string;
      loadingTarget?: LoadingTarget;
      showError?: boolean;
      errorTitle?: string;
      errorMessage?: string;
    },
  ): Promise<R | null> => {
    setStore((s) => ({ ...s, loading: true, error: null }));
    if (options?.loadingTarget)
      setUiStore("loadingTarget", options.loadingTarget);
    if (options?.action)
      setStore((s) => ({
        ...s,
        errors: { ...s.errors, [options.action!]: null },
      }));

    try {
      const result = await fn();
      return result;
    } catch (err) {
      let message = "Unexpected error";
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message || err.message;
      }

      setStore((s) => ({ ...s, error: message }));

      if (options?.action) {
        setStore((s) => ({
          ...s,
          errors: { ...s.errors, [options.action!]: message },
        }));
      }

      if (options?.showError) {
        addNotification({
          title: options.errorTitle ?? "Error",
          description:
            options.errorMessage ?? message ?? "An unexpected error occurred.",
          type: "error",
        });
      }

      return null;
    } finally {
      setStore((s) => ({ ...s, loading: false }));
      setUiStore("loadingTarget", LoadingTarget.None);
    }
  };

  return { store, setStore, run };
};
