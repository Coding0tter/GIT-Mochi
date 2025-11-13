import Skeleton from "@client/shared/components/skeleton/skeleton.tsx";
import {
  fetchCurrentProject,
  projectStore,
  searchGitlabProjects,
  setSelectedProject,
} from "@client/shared/stores/project.store.ts";
import { debounce } from "lodash";
import { For, onMount, Show } from "solid-js";
import styles from "./setup-project.module.css";
import {
  setNextDisabled,
  setupStore,
} from "@client/features/settings/stores/setup.store.ts";

const SetupProject = () => {
  onMount(async () => {
    setNextDisabled(true);
    await searchGitlabProjects("");
    fetchCurrentProject().then((project) => {
      if (project) {
        document
          .getElementById(project.id.toString())
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
        setNextDisabled(false);
      }
    });
  });

  const handleSearch = debounce(async (query: string) => {
    await searchGitlabProjects(query);
  }, 200);

  return (
    <div class={styles.projectStep}>
      <h2>Select a Default Project</h2>
      <p>Choose a project to start with.</p>

      <div class={styles.formGroup}>
        <input
          class={styles.searchInput}
          type="text"
          placeholder="Search projects by name"
          onInput={(e) => handleSearch(e.currentTarget.value)}
        />
      </div>

      <div class={styles.divider} />

      <div class={styles.projectList}>
        <Show
          when={projectStore.projects.length !== 0}
          fallback={
            <div class={styles.skeletonList}>
              <For each={Array.from({ length: 5 })}>
                {() => (
                  <div class={styles.skeletonItem}>
                    <Skeleton width="40px" height="40px" radius="8px" />

                    <div class={styles.skeletonContent}>
                      <Skeleton width="100%" height="16px" />
                      <Skeleton width="100%" height="14px" />
                    </div>
                  </div>
                )}
              </For>
            </div>
          }
        >
          <For each={projectStore.projects}>
            {(project) => (
              <div
                id={project.id.toString()}
                class={`${styles.projectOption} ${projectStore.project?.id === project.id ? styles.selected : ""}`}
                onClick={async () => {
                  await setSelectedProject(project);
                  setNextDisabled(false);
                }}
              >
                <i class="fa-solid fa-folder"></i>
                <div>
                  <strong>
                    {project.id} - {project.name_with_namespace}
                  </strong>
                  {project.description && <small>{project.description}</small>}
                </div>
              </div>
            )}
          </For>
        </Show>
      </div>
    </div>
  );
};

export default SetupProject;
