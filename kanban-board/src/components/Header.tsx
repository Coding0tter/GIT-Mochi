import { createEffect, createSignal, JSX, onMount } from "solid-js";
import { getUser } from "../services/utils";
import logo from "../assets/logo.svg";
import { useCommandProcessor } from "../services/commandProcessor";
import {
  InputMode,
  setCommandInputRef,
  uiStore,
  setCommandInputValue,
  setCurrentProject,
  setCommandPlaceholder,
} from "../stores/uiStore";
import { handleGitlabSyncAsync } from "../stores/taskStore";
import { COMMANDS } from "../commands";
import {
  commandStore,
  filteredDropdownValues,
  setActiveDropdownIndex,
  setDropdownValues,
} from "../stores/commandStore";
import { getProjectAsync } from "../services/customProjectService";

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

  const { handleCommand, resetPendingCommand } = useCommandProcessor();

  onMount(async () => {
    setUser(await getUser());
    setCurrentProject(await getProjectAsync());
  });

  createEffect(() => {
    if (uiStore.inputMode === InputMode.Commandline) {
      setCommandInputValue("");
      setDropdownValues(
        COMMANDS.filter((command) => command.display).map((command) => ({
          value: command.action,
          text: command.text,
          description: command.description,
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
      } else if (
        event.key === "Enter" &&
        (uiStore.commandInputValue !== "" || !commandStore.waitingForInput)
      ) {
        handleCommand();
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
        setCommandPlaceholder("Search tasks...");
        break;
      case InputMode.Commandline:
        setCommandPlaceholder("Type a command...");
        break;
      default:
        setCommandPlaceholder(
          "Strg + F to search / Strg + P to open commandline"
        );
        resetPendingCommand();
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
            readOnly={uiStore.commandReadonly}
            value={!uiStore.loading ? uiStore.commandInputValue : "Loading..."}
            placeholder={uiStore.commandPlaceholder}
            onKeyDown={handleKeydown}
            onInput={handleInput}
          />
          {uiStore.inputMode === InputMode.Commandline &&
            filteredDropdownValues().length > 0 && (
              <ul class="command-dropdown">
                {filteredDropdownValues().map((item, index) => (
                  <li
                    id={`command-item-${index}`} // Add unique ID for each item
                    class="command-item"
                    onClick={handleCommand}
                    style={{
                      background:
                        commandStore.activeDropdownIndex === index
                          ? "rgba(255, 255, 255, 0.1)"
                          : "none",
                    }}
                  >
                    {item.text}
                    {item?.description && " - (" + item.description + ")"}
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
          <strong>{uiStore.currentProject?.name || "none"}</strong>
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
