import { DropdownValue } from "../stores/commandStore";

export interface CommandStep {
  prompt: string;
  key?: string;
  dropdownValues?: DropdownValue[] | (() => DropdownValue[]);
  awaitInput?: boolean;
  cleanDropdown?: boolean;
  executeAsync: (props: CommandProps) => Promise<void>;
  onError?: (error: Error, repeat: () => void) => void;
}

export interface CommandProps {
  input?: any;
  next: () => void;
  repeat: () => void;
  goto: (key: string) => void;
}

export interface CommandPipeline {
  name: string;
  description: string;
  steps: CommandStep[];
}
