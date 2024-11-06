import { createSignal, JSX, onMount } from "solid-js";
import logo from "../../../assets/logo.svg";
import { getProjectAsync } from "../../../services/customProjectService";
import { getUserAsync } from "../../../services/userService";
import { setCurrentProject } from "../../../stores/uiStore";
import CommandLine from "../../shared/CommandLine/CommandLine";
import styles from "./Header.module.css";

interface HeaderProps {}

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
        <div class={styles.userInfo}>
          {user() && (
            <div title={user()!.username} class={styles.user}>
              <img src={user()!.avatar_url} alt={user()!.name} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
