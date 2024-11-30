import { createSignal, JSX, onMount } from "solid-js";
import logo from "../../../assets/logo.svg";
import { getProjectAsync } from "../../../services/customProjectService";
import { getUserAsync } from "../../../services/userService";
import { setCurrentProject } from "../../../stores/uiStore";
import CommandLine from "../../shared/CommandLine/CommandLine";
import styles from "./Header.module.css";
import { random } from "lodash";
import { WaveText } from "../WaveText/WaveText";

interface IUser {
  gitlabId: number;
  username: string;
  email: string;
  name: string;
  avatar_url: string;
}

const slogans = ["vim-like", "keyboard-first", "mice-are-for-cats", "h-j-k-l"];

const Header = (): JSX.Element => {
  const [user, setUser] = createSignal<IUser | null>(null);
  const [slogan, setSlogan] = createSignal<string>("");

  onMount(async () => {
    const randomIndex = random(slogans.length);
    setSlogan(slogans.at(randomIndex) || "happy-little-accidents");

    setUser(await getUserAsync());
    setCurrentProject(await getProjectAsync());
  });

  return (
    <div
      class={styles.headerContainer}
      style={{ "view-transition-name": "header" }}
    >
      <div class={styles.headerRow}>
        <div class={styles.headerLogo}>
          <img src={logo} alt="GitLab-Mochi Logo"></img>
          <h1>Mochi</h1>
          <WaveText text={slogan} />
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
