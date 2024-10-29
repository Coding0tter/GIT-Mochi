import { closeModalAndUnfocus } from "../services/uiService";
import {
  commandStore,
  getActiveDropdownValue,
  resetCommandline,
  setActiveDropdownIndex,
  setDropdownValues,
} from "../stores/commandStore";
import { setCommandInputValue, setCommandPlaceholder } from "../stores/uiStore";
import { CommandPipeline } from "./types";

export class CommandProcessor {
  private currentStepIndex: number = 0;
  private pipeline: CommandPipeline;
  private resolveInput?: (input: any) => void; // Stores the resolve function to continue execution

  constructor() {
    this.pipeline = {
      ...getActiveDropdownValue().value,
    };
  }

  async start() {
    await this.executeCurrentStep();
  }

  private async executeCurrentStep() {
    setCommandInputValue("");
    setActiveDropdownIndex(0);

    if (this.currentStepIndex >= this.pipeline.steps.length) {
      resetCommandline();
      closeModalAndUnfocus();

      return;
    }

    const step = this.pipeline.steps[this.currentStepIndex];

    setCommandPlaceholder(step.prompt);
    if (step.dropdownValues) setDropdownValues(step.dropdownValues);
    else if (step.cleanDropdown) setDropdownValues([]);

    const next = () => {
      this.currentStepIndex++;
      this.executeCurrentStep();
    };

    const retry = () => {
      this.executeCurrentStep();
    };

    try {
      if (step.awaitInput) {
        await step.executeAsync(await this.waitForUserInput(), next, retry);
      } else {
        await step.executeAsync(undefined, next, retry);
      }
    } catch (error: any) {
      if (step.onError) {
        step.onError(error, retry);
      } else {
        console.error("Error:", error.message);
      }
    }
  }

  private waitForUserInput(): Promise<any> {
    return new Promise((resolve) => {
      this.resolveInput = resolve;
    });
  }

  receiveInput(input: any) {
    if (this.resolveInput) {
      this.resolveInput(input);
      this.resolveInput = undefined;
    }
  }
}
