import { userStore } from "@client/shared/stores/user.store.ts";
import { useNavigate, useLocation } from "@solidjs/router";
import dayjs from "dayjs";
import { random } from "lodash";
import { createSignal, type JSXElement, onMount, onCleanup } from "solid-js";
import logo from "../../../assets/logo.svg";
import { getProjectAsync } from "../../../services/customProjectService";
import { setCurrentProject } from "../../../stores/uiStore";
import CommandLine from "../CommandLine/CommandLine";
import { WaveText } from "../WaveText/WaveText";
import styles from "./Header.module.css";

const slogans = ["vim-like", "keyboard-first", "mice-are-for-cats", "h-j-k-l"];

const Header = (): JSXElement => {
  const [slogan, setSlogan] = createSignal<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = createSignal(false);
  const isJune = dayjs().month() === 5;
  const navigate = useNavigate();
  const location = useLocation();
  let dropdownRef: HTMLDivElement | undefined;

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  onMount(async () => {
    const randomIndex = random(slogans.length);
    setSlogan(slogans.at(randomIndex) || "happy-little-accidents");

    setCurrentProject(await getProjectAsync());

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    onCleanup(() => {
      document.removeEventListener("click", handleClickOutside);
    });
  });

  const toggleDropdown = (e: MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen());
  };

  const handleNavigation = (path: string) => {
    setIsDropdownOpen(false);
    navigate(path);
  };

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
        <div class={styles.userInfo} ref={dropdownRef}>
          {userStore.user && (
            <>
              <div
                title={userStore.user.username}
                class={styles.user}
                onClick={toggleDropdown}
              >
                <img src={userStore.user.avatar_url} alt={userStore.user.name} />
              </div>
              {isDropdownOpen() && (
                <div class={styles.dropdown}>
                  <div class={styles.dropdownHeader}>
                    <div class={styles.userName}>{userStore.user.name}</div>
                    <div class={styles.userUsername}>@{userStore.user.username}</div>
                  </div>
                  <div class={styles.dropdownMenu}>
                    <button
                      class={`${styles.dropdownItem} ${isActivePath("/app/kanban") ? styles.active : ""}`}
                      onClick={() => handleNavigation("/app/kanban")}
                    >
                      <span class={styles.itemIcon}>📋</span>
                      <span>Kanban</span>
                    </button>
                    <button
                      class={`${styles.dropdownItem} ${isActivePath("/app/todo") ? styles.active : ""}`}
                      onClick={() => handleNavigation("/app/todo")}
                    >
                      <span class={styles.itemIcon}>✓</span>
                      <span>Todo</span>
                    </button>
                    <button
                      class={`${styles.dropdownItem} ${isActivePath("/app/settings") ? styles.active : ""}`}
                      onClick={() => handleNavigation("/app/settings")}
                    >
                      <span class={styles.itemIcon}>⚙</span>
                      <span>Settings</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
