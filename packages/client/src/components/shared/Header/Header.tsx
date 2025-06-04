import { createSignal, type JSXElement, onMount } from "solid-js";
import logo from "../../../assets/logo.svg";
import { getProjectAsync } from "../../../services/customProjectService";
import { setCurrentProject, uiStore } from "../../../stores/uiStore";
import CommandLine from "../CommandLine/CommandLine";
import styles from "./Header.module.css";
import { random } from "lodash";
import { WaveText } from "../WaveText/WaveText";
import dayjs from "dayjs";

const slogans = ["vim-like", "keyboard-first", "mice-are-for-cats", "h-j-k-l"];

const Header = (): JSXElement => {
  const [slogan, setSlogan] = createSignal<string>("");
  const isJune = dayjs().month() === 5;

  onMount(async () => {
    const randomIndex = random(slogans.length);
    setSlogan(slogans.at(randomIndex) || "happy-little-accidents");

    setCurrentProject(await getProjectAsync());
  });

  return (
    <div
      class={`${styles.headerContainer} ${isJune ? styles.pride : ""}`}
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
          {uiStore.user && (
            <div title={uiStore.user.username} class={styles.user}>
              <img src={uiStore.user.avatar_url} alt={uiStore.user.name} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
