import { STATES } from "@client/constants.ts";
import {
  fetchColumnLabels,
  labelStore,
  removeLabel,
  searchGitlabLabels,
  setColumnLabel,
} from "@client/shared/stores/label.store.ts";
import { debounce } from "lodash";
import { createSignal, For, onMount, Show, onCleanup } from "solid-js";
import styles from "./label-settings.module.css";

const LabelSettings = () => {
  onMount(() => {
    fetchColumnLabels();
  });

  return (
    <div class={styles.container}>
      <div class={styles.columnsList}>
        <For each={STATES}>
          {(state) => {
            const selectedLabel = () =>
              labelStore.columnLabels?.[state.id] ?? null;

            const [open, setOpen] = createSignal(false);
            const [query, setQuery] = createSignal("");
            const [dropdownPosition, setDropdownPosition] = createSignal<"bottom" | "top">("bottom");
            let searchSelectRef: HTMLDivElement | undefined;

            onMount(() => {
              const handleClickOutside = (event: MouseEvent) => {
                if (
                  searchSelectRef &&
                  !searchSelectRef.contains(event.target as Node)
                ) {
                  setOpen(false);
                }
              };

              document.addEventListener("click", handleClickOutside);
              onCleanup(() => {
                document.removeEventListener("click", handleClickOutside);
              });
            });

            const checkDropdownPosition = () => {
              if (searchSelectRef) {
                const rect = searchSelectRef.getBoundingClientRect();
                const dropdownHeight = 240; // max-height of dropdown + padding + margin
                const spaceBelow = window.innerHeight - rect.bottom;
                const spaceAbove = rect.top;

                // Show above if there's not enough space below
                if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
                  setDropdownPosition("top");
                } else {
                  setDropdownPosition("bottom");
                }
              }
            };

            const handleFocus = () => {
              setOpen(true);
              checkDropdownPosition();
            };

            const handleInput = debounce(async (value: string) => {
              setQuery(value);
              setOpen(true);
              checkDropdownPosition();
              await searchGitlabLabels(value);
            }, 200);

            const handleSelect = async (
              gitlabLabel: (typeof labelStore.labels)[0],
            ) => {
              await setColumnLabel(state.id, gitlabLabel);
              setOpen(false);
              setQuery("");
            };

            return (
              <div class={styles.columnCard}>
                <div class={styles.columnHeader}>
                  <h4>{state.display_name}</h4>
                  <span class={styles.columnId}>{state.id}</span>
                </div>

                <div
                  class={styles.searchSelect}
                  ref={searchSelectRef}
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    class={styles.searchInput}
                    type="text"
                    placeholder="Search labels"
                    onInput={(e) => handleInput(e.currentTarget.value)}
                    onFocus={handleFocus}
                  />

                  <Show when={open() && labelStore.labels.length}>
                    <div class={`${styles.dropdown} ${dropdownPosition() === "top" ? styles.dropdownTop : styles.dropdownBottom}`}>
                      <For each={labelStore.labels}>
                        {(gitlab_label) => (
                          <button
                            type="button"
                            class={styles.labelOption}
                            style={{
                              "background-color": gitlab_label.color,
                              color: gitlab_label.text_color,
                            }}
                            onClick={async () =>
                              await handleSelect(gitlab_label)
                            }
                          >
                            <i class="fa-solid fa-tag" />
                            <span>{gitlab_label.name}</span>
                          </button>
                        )}
                      </For>
                    </div>
                  </Show>
                </div>

                <div class={styles.columnContent}>
                  <Show when={selectedLabel()}>
                    {(l) => (
                      <div class={styles.selectedLabelDisplay}>
                        <div
                          class={styles.labelBadge}
                          style={{
                            "background-color": l().color,
                            color: l().text_color,
                          }}
                        >
                          <i class="fa-solid fa-tag" />
                          {l().name}
                        </div>
                        <button
                          type="button"
                          class={styles.removeButton}
                          onClick={() => removeLabel(state.id)}
                          title="Remove label"
                        >
                          <i class="fa-solid fa-times" />
                        </button>
                      </div>
                    )}
                  </Show>
                </div>
              </div>
            );
          }}
        </For>
      </div>
    </div>
  );
};

export default LabelSettings;
