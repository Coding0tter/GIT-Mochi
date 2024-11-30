import { closeModalAndUnfocus } from "../services/uiService";
import {
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

  next = () => {
    this.currentStepIndex++;
    this.executeCurrentStep();
  };

  repeat = () => {
    this.executeCurrentStep();
  };

  goto = (key: string) => {
    this.currentStepIndex = this.pipeline.steps.findIndex(
      (step) => step.key === key
    );
    this.executeCurrentStep();
  };

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
    if (step.dropdownValues)
      setDropdownValues(
        typeof step.dropdownValues === "function"
          ? step.dropdownValues()
          : step.dropdownValues
      );
    else if (step.cleanDropdown) setDropdownValues([]);

    try {
      if (step.awaitInput) {
        await step.executeAsync({
          input: await this.waitForUserInput(),
          next: this.next,
          repeat: this.repeat,
          goto: this.goto,
        });
      } else {
        await step.executeAsync({
          next: this.next,
          repeat: this.repeat,
          goto: this.goto,
        });
      }
    } catch (error: any) {
      if (step.onError) {
        step.onError(error, this.repeat);
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
