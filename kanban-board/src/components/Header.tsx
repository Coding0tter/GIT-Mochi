import { createEffect, createSignal, JSX, onMount } from "solid-js";
import { getProject, getUser } from "../services/utils";
import logo from "../assets/logo.svg";
import { useCommandProcessor } from "../services/commandProcessor";
import {
  InputMode,
  setCommandInputRef,
  uiStore,
  setCommandInputValue,
  setCurrentProject,
} from "../stores/uiStore";
import { handleGitlabSyncAsync } from "../stores/taskStore";
import { COMMANDS } from "../commands";
import {
  commandStore,
  filteredDropdownValues,
  setActiveDropdownIndex,
  setDropdownValues,
} from "../stores/commandStore";

interface HeaderProps {
  onToggleCreateTask: () => void;
  showCreateTask: boolean;
}

interface IUser {
  gitlabId: number;
  username: string;
  email: string;
  name: string;
  avatar_url: string;
}

const Header = (props: HeaderProps): JSX.Element => {
  const [user, setUser] = createSignal<IUser | null>(null);
  const [placeholder, setPlaceholder] = createSignal<string>("");

  const { handleCommand } = useCommandProcessor();

  onMount(async () => {
    setUser(await getUser());
    setCurrentProject(await getProject());
  });

  createEffect(() => {
    if (uiStore.inputMode === InputMode.Commandline) {
      setCommandInputValue("");
      setDropdownValues(
        COMMANDS.filter((command) => command.display).map((command) => ({
          value: command.action,
          text: command.text,
          description: command.description,
          action: command.action,
        }))
      );
    }

    getPlaceholder();
  }, [uiStore.inputMode]);

  const handleInput = (event: Event) => {
    const input = event.target as HTMLInputElement;
    setCommandInputValue(input.value);
    if (uiStore.inputMode === InputMode.Search) {
      setCommandInputValue(input.value);
    }
  };

  const handleKeydown = (event: KeyboardEvent) => {
    if (uiStore.inputMode === InputMode.Commandline) {
      let newSelectedCommand = commandStore.activeDropdownIndex;
      if (event.key === "ArrowDown") {
        newSelectedCommand =
          (commandStore.activeDropdownIndex + 1) %
          filteredDropdownValues().length;
      } else if (event.key === "ArrowUp") {
        newSelectedCommand =
          (commandStore.activeDropdownIndex -
            1 +
            filteredDropdownValues().length) %
          filteredDropdownValues().length;
      } else if (event.key === "Enter") {
        handleCommand(
          filteredDropdownValues()[commandStore.activeDropdownIndex]
        );
        return;
      }

      setActiveDropdownIndex(newSelectedCommand);
      // Scroll the newly selected item into view
      document
        .getElementById(`command-item-${newSelectedCommand}`)
        ?.scrollIntoView({ block: "nearest" });
    }
  };

  const getPlaceholder = () => {
    switch (uiStore.inputMode) {
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
            ref={(el) => setCommandInputRef(el)}
            type="text"
            value={!uiStore.loading ? uiStore.commandInputValue : "Loading..."}
            placeholder={placeholder()}
            onKeyDown={handleKeydown}
            onInput={handleInput}
          />
          {uiStore.inputMode === InputMode.Commandline && (
            <ul class="command-dropdown">
              {filteredDropdownValues().map((item, index) => (
                <li
                  id={`command-item-${index}`} // Add unique ID for each item
                  class="command-item"
                  onClick={() => handleCommand(item)}
                  style={{
                    background:
                      commandStore.activeDropdownIndex === index
                        ? "rgba(255, 255, 255, 0.1)"
                        : "none",
                  }}
                >
                  {item.text}
                  {item.description !== "" && " - (" + item.description + ")"}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div class="header-actions">
          <button
            onClick={async () => await handleGitlabSyncAsync()}
            disabled={uiStore.loading}
          >
            {uiStore.loading ? "Syncing..." : "(S)ync Gitlab"}
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
          <strong>
            {uiStore.currentProject?.name_with_namespace ?? "none"}
          </strong>
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
