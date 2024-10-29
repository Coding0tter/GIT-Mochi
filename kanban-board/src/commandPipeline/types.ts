import { DropdownValue } from "../stores/commandStore";

export interface CommandStep {
  prompt: string;
  dropdownValues?: DropdownValue[];
  awaitInput?: boolean;
  cleanDropdown?: boolean;
  executeAsync: (
    input: any,
    next: () => void,
    retry: () => void
  ) => Promise<void>;
  onError?: (error: Error, retry: () => void) => void;
}

export interface CommandPipeline {
  name: string;
  description: string;
  steps: CommandStep[];
}
