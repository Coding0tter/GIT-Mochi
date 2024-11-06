import { DropdownValue } from "../stores/commandStore";

export interface CommandStep {
  prompt: string;
  key?: string;
  dropdownValues?: DropdownValue[] | (() => DropdownValue[]);
  awaitInput?: boolean;
  cleanDropdown?: boolean;
  executeAsync: (
    input: any,
    next: () => void,
    repeat: () => void,
    goto: (key: string) => void
  ) => Promise<void>;
  onError?: (error: Error, repeat: () => void) => void;
}

export interface CommandPipeline {
  name: string;
  description: string;
  steps: CommandStep[];
}
