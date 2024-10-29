import { createSignal, JSX, onMount } from "solid-js";
import { getProjectAsync } from "../../services/customProjectService";
import { getUserAsync } from "../../services/userService";
import { handleGitlabSyncAsync } from "../../stores/taskStore";
import { setCurrentProject, uiStore } from "../../stores/uiStore";
import logo from "../../assets/logo.svg";
import CommandLine from "../CommandLine/CommandLine";
import styles from "./Header.module.css";
import Badge from "../Badge/Badge";
import Button from "../Button/Button";

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

  onMount(async () => {
    setUser(await getUserAsync());
    setCurrentProject(await getProjectAsync());
  });

  return (
    <div class={styles.headerContainer}>
      <div class={styles.headerRow}>
        <div class={styles.headerLogo}>
          <img src={logo} alt="GitLab-Mochi Logo"></img>
          <h1>Mochi</h1>
          <div class="wave-text">
            {"keyboard-first".split("").map((char, index) => (
              <span class="wave-char" style={{ "--index": index }}>
                {char}
              </span>
            ))}
          </div>
        </div>
        <CommandLine />
        <div class={styles.headerActions}>
          <Button
            onClick={async () => await handleGitlabSyncAsync()}
            disabled={uiStore.loading}
          >
            {uiStore.loading ? (
              "Syncing..."
            ) : (
              <span>
                (S)ync <i class="fa-brands fa-gitlab"></i>
              </span>
            )}
          </Button>
          <Button onClick={props.onToggleCreateTask}>
            {props.showCreateTask ? "Close Create New" : "(C)reate New"}
          </Button>
        </div>
        <div class={styles.userInfo}>
          {user() && (
            <div title={user()!.username} class={styles.user}>
              <img src={user()!.avatar_url} alt={user()!.name} />
            </div>
          )}
        </div>
      </div>

      <div class={styles.legendRow}>
        <Badge type="none">
          backend:{" "}
          <strong>
            {uiStore.isConnected ? (
              <i class="fa-solid fa-link"></i>
            ) : (
              <i class="fa-solid fa-link-slash"></i>
            )}
          </strong>
        </Badge>
        <Badge type="none">
          <strong>{uiStore.currentProject?.name || "none"}</strong>
        </Badge>
        <Badge type="deleted">Deleted</Badge>
        <Badge type="custom">Custom Task</Badge>
        <Badge type="mergeRequest">Merge Request</Badge>
        <Badge type="issue">Issue</Badge>
      </div>
    </div>
  );
};

export default Header;
