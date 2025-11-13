import { createBaseStore } from "@client/stores/baseStore.ts";

interface CommandlineStore {
  input: string;
}

const { store: commandlineStore, setStore: setCommandlineStore } =
  createBaseStore<CommandlineStore>({
    input: "",
  });

export { commandlineStore };

export const setInput = (input: string) => {
  setCommandlineStore("input", input);
};
