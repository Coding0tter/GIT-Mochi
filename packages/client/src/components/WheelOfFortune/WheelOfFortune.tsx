import { createSignal } from "solid-js";
import styles from "./WheelOfFortune.module.css";

export interface GitlabUser {
  id: number;
  avatar_url: string;
  email: string;
  name: string;
  username: string;
}

interface WheelOfFortuneProps {
  users: GitlabUser[];
  onSelect?: (user: GitlabUser) => void;
}

const WheelOfFortune = (props: WheelOfFortuneProps) => {
  const [offset, setOffset] = createSignal(0);
  const [spinning, setSpinning] = createSignal(false);
  const [selectedIndex, setSelectedIndex] = createSignal<number | null>(null);

  // keep in sync with CSS (--item-height)
  const ITEM_HEIGHT = 80;
  const LOOPS = 100;

  const extendedUsers = () => {
    if (!props.users.length) return [];
    const arr: GitlabUser[] = [];
    for (let i = 0; i < LOOPS; i++) arr.push(...props.users);
    return arr;
  };

  const handleSpin = () => {
    if (!props.users.length || spinning()) return;

    // Clear previous selection
    setSelectedIndex(null);

    const usersLen = props.users.length;
    const idx = Math.floor(Math.random() * usersLen);

    const currentOffset = offset();
    const currentTopIndex = Math.floor(currentOffset / ITEM_HEIGHT) % usersLen;

    const spins = 4 + Math.floor(Math.random() * 3); // 4–6 full cycles
    const cycleDistance = spins * usersLen * ITEM_HEIGHT;

    // Calculate to land on idx in the middle (offset by 1 row since middle is the second visible row)
    const diffIndex = (idx - currentTopIndex + usersLen) % usersLen;
    const middleOffset = ITEM_HEIGHT; // offset to center the selected item in the middle row

    const targetOffset =
      currentOffset + cycleDistance + diffIndex * ITEM_HEIGHT - middleOffset;

    setSpinning(true);
    setOffset(targetOffset);

    // fire when animation roughly finishes (matches transition duration in CSS)
    window.setTimeout(() => {
      setSpinning(false);
      setSelectedIndex(idx);
      if (props.onSelect) {
        props.onSelect(props.users[idx]);
      }
    }, 1800);
  };

  const selectedUser = () =>
    selectedIndex() !== null ? props.users[selectedIndex()!] : null;

  return (
    <>
      <div class={styles.backdrop} onClick={() => {}} />
      <div class={styles.root}>
        <div class={styles.machine}>
        <div class={styles.header}>
          <span class={styles.title}>Wheel of Fortune</span>
        </div>

        <div class={styles.window}>
          <div
            class={styles.track}
            style={{
              transform: `translateY(${-offset()}px)`,
            }}
          >
            {extendedUsers().map((user, i) => (
              <div class={styles.row} data-index={i}>
                <div class={styles.avatarWrapper}>
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    class={styles.avatar}
                  />
                </div>
                <div class={styles.info}>
                  <div class={styles.name}>{user.name}</div>
                  <div class={styles.username}>@{user.username}</div>
                </div>
              </div>
            ))}
          </div>

          {/* highlight "selection line" in the middle - only show when not spinning and user selected */}
          {!spinning() && selectedUser() && (
            <div class={styles.selectionBar} />
          )}
          <div class={styles.fadeTop} />
          <div class={styles.fadeBottom} />
        </div>

        <button
          class={styles.spinButton}
          onClick={handleSpin}
          disabled={!props.users.length || spinning()}
        >
          {spinning() ? "Spinning..." : "Spin"}
        </button>
      </div>

      {selectedUser() && (
        <div class={styles.result}>
          <div class={styles.resultLabel}>Selected user</div>
          <div class={styles.resultCard}>
            <img
              src={selectedUser()!.avatar_url}
              alt={selectedUser()!.name}
              class={styles.resultAvatar}
            />
            <div class={styles.resultInfo}>
              <div class={styles.resultName}>{selectedUser()!.name}</div>
              <div class={styles.resultUsername}>
                @{selectedUser()!.username}
              </div>
              <div class={styles.resultEmail}>{selectedUser()!.email}</div>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default WheelOfFortune;
