import { createEffect, createSignal, JSX, onMount } from "solid-js";
import {
  getProject,
  getUser,
  loadProjectsAsync,
  setProject,
} from "../services/utils";
import { InputMode } from "../App";
import { CommandHandler } from "../services/commandHandler";
import { addNotification } from "../services/notificationService";
import logo from "../assets/logo.svg";

interface HeaderProps {
  loading: boolean;
  onSync: () => Promise<void>;
  onToggleCreateTask: () => void;
  showCreateTask: boolean;
  onSearch: (query: string) => void;
  setSearchRef: (el: HTMLInputElement) => void;
  inputMode: InputMode;
  commandHandler: CommandHandler;
}

interface IUser {
  gitlabId: number;
  username: string;
  email: string;
  name: string;
  avatar_url: string;
}

interface IProject {
  id: string;
  name_with_namespace: string;
  description: string;
}

type Command = {
  text: string;
  description: string;
  value?: string;
  action?: string;
  nextAction?: Command;
};

const COMMANDS = [
  {
    text: "select project",
    description: "Select a project to view its tasks",
    action: "loadProjects",
    nextAction: {
      action: "setProject",
    },
  },
  {
    text: "create task",
    description: "Open the create task form",
    action: "openCreateTask",
  },
] as Command[];

const Header = (props: HeaderProps): JSX.Element => {
  const [user, setUser] = createSignal<IUser | null>(null);
  const [inputValue, setInputValue] = createSignal("");
  const [selectedCommand, setSelectedCommand] = createSignal<number>(0);
  const [placeholder, setPlaceholder] = createSignal<string>("");
  const [currentProject, setCurrentProject] = createSignal<IProject>();
  const [dropDownValues, setDropDownValues] = createSignal<
    {
      text: string;
      description: string;
    }[]
  >([]);
  const [currentCommand, setCurrentCommand] = createSignal<Command>();
  const [loading, setLoading] = createSignal(false);

  onMount(async () => {
    setUser(await getUser());
    setCurrentProject(await getProject());
  });

  createEffect(() => {
    if (props.inputMode === InputMode.Commandline) {
      setInputValue("");
      setDropDownValues(COMMANDS);
    }

    getPlaceholder();
  }, [props.inputMode]);

  const handleInput = (event: Event) => {
    const input = event.target as HTMLInputElement;
    setInputValue(input.value);
    if (props.inputMode === InputMode.Search) {
      props.onSearch(input.value);
    }
  };

  const handleCommand = async (command: Partial<Command>) => {
    setLoading(true);
    try {
      if (currentCommand()?.nextAction) {
        const nextAction = currentCommand()?.nextAction;
        setCurrentCommand(currentCommand()!.nextAction);

        handleCommand({
          ...nextAction,
          value: command.value,
        });
        return;
      }

      switch (command.action) {
        case "openCreateTask":
          props.commandHandler.openCreate();
          break;
        case "loadProjects":
          try {
            setCurrentCommand(command as Command);
            const projects = await loadProjectsAsync();
            setDropDownValues(
              projects.map(
                (project: {
                  id: any;
                  name_with_namespace: any;
                  description: any;
                }) => ({
                  text: `(${project.id}): ${project.name_with_namespace}`,
                  description: project.description,
                  value: project.id,
                })
              )
            );
            setInputValue("");
          } catch (error) {
            addNotification({
              title: "Error",
              description: "Failed to load projects",
              type: "error",
            });
            props.commandHandler.closeModalAndUnfocus();
          }
          break;
        case "setProject":
          try {
            setCurrentCommand();
            await setProject(command.value!);
            await props.onSync();
            setCurrentProject(await getProject());

            addNotification({
              title: "Success",
              description: "Project set successfully",
              type: "success",
            });

            setInputValue("");
          } catch (error) {
            addNotification({
              title: "Error",
              description: "Failed to set project",
              type: "error",
            });
          } finally {
            props.commandHandler.closeModalAndUnfocus();
          }
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeydown = (event: KeyboardEvent) => {
    if (props.inputMode === InputMode.Commandline) {
      let newSelectedCommand = selectedCommand();
      if (event.key === "ArrowDown") {
        newSelectedCommand = (selectedCommand() + 1) % dropDownValues().length;
      } else if (event.key === "ArrowUp") {
        newSelectedCommand =
          (selectedCommand() - 1 + dropDownValues().length) %
          dropDownValues().length;
      } else if (event.key === "Enter") {
        handleCommand(
          dropDownValues().filter((item) => item.text.includes(inputValue()))[
            selectedCommand()
          ]
        );
        return;
      }

      setSelectedCommand(newSelectedCommand);
      // Scroll the newly selected item into view
      document
        .getElementById(`command-item-${newSelectedCommand}`)
        ?.scrollIntoView({ block: "nearest" });
    }
  };

  const getPlaceholder = () => {
    switch (props.inputMode) {
      case InputMode.Search:
        setPlaceholder("Search tasks...");
        break;
      case InputMode.Commandline:
        setPlaceholder("Type a command...");
        break;
      default:
        setPlaceholder("Strg + F to search / Strg + P to open commandline");
        break;
    }
  };

  return (
    <div class="header-container">
      <div class="header-row">
        <div class="heading">
          <img src={logo} alt="GitLab-Mochi Logo"></img>
          <h1>GitLab-Mochi</h1>
          <div class="wave-text">
            {"keyboard-friendly".split("").map((char, index) => (
              <span class="wave-char" style={{ "--index": index }}>
                {char}
              </span>
            ))}
          </div>
        </div>
        <div class="search-bar">
          <input
            ref={(el) => props.setSearchRef(el)}
            type="text"
            value={!loading() ? inputValue() : "Loading..."}
            placeholder={placeholder()}
            onKeyDown={handleKeydown}
            onInput={handleInput}
          />
          {props.inputMode === InputMode.Commandline && (
            <ul class="command-dropdown">
              {dropDownValues()
                .filter((item) => item.text.includes(inputValue()))
                .map((item, index) => (
                  <li
                    id={`command-item-${index}`} // Add unique ID for each item
                    class="command-item"
                    onClick={() => handleCommand(item)}
                    style={{
                      background:
                        selectedCommand() === index
                          ? "rgba(255, 255, 255, 0.1)"
                          : "none",
                    }}
                  >
                    {item.text} ({item.description})
                  </li>
                ))}
            </ul>
          )}
        </div>
        <div class="header-actions">
          <button onClick={props.onSync} disabled={props.loading}>
            {props.loading ? "Syncing..." : "(S)ync Gitlab"}
          </button>
          <button onClick={props.onToggleCreateTask}>
            {props.showCreateTask ? "Close Create New" : "(C)reate New"}
          </button>
        </div>
        <div class="user-info">
          {user() && (
            <div title={user()!.username} class="user">
              <img src={user()!.avatar_url} alt={user()!.name} />
            </div>
          )}
        </div>
      </div>

      <div class="legend-row">
        <span>
          active project:{" "}
          <strong>{currentProject()?.name_with_namespace ?? "none"}</strong>
        </span>
        <span
          class="legend-item"
          style={{ background: "#e74c3c", color: "white" }}
        >
          Deleted
        </span>
        <span class="legend-item" style={{ background: "#fab387" }}>
          Custom Task
        </span>
        <span class="legend-item" style={{ background: "#74c7ec" }}>
          Merge Request
        </span>
        <span class="legend-item" style={{ background: "#4eda6c" }}>
          Issue
        </span>
      </div>
    </div>
  );
};

export default Header;
