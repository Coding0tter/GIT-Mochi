import TaskCard from "@client/components/Kanban/TaskCard/TaskCard";
import { keyboardNavigationStore } from "@client/stores/keyboardNavigationStore";
import {
  setSelectedTaskForModal,
  setActiveModal,
  ModalType,
} from "@client/stores/modalStore";
import { orderBy } from "lodash";
import { createEffect, For } from "solid-js";
import type { ITask } from "shared/types/task";
import styles from "./TaskColumn.module.css";
import { uiStore } from "@client/stores/uiStore";

interface TaskColumnProps {
  status: { display_name: string; id: string };
  tasks: Partial<ITask>[];
  columnIndex: number;
}

const TaskColumn = (props: TaskColumnProps) => {
  let taskRefs: HTMLElement[] = [];

  createEffect(() => {
    if (
      keyboardNavigationStore.selectedColumnIndex === props.columnIndex &&
      taskRefs[keyboardNavigationStore.selectedTaskIndex]
    ) {
      setTimeout(() => {
        taskRefs[keyboardNavigationStore.selectedTaskIndex].scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });
    }
  });

  return (
    <div class={styles.column} data-status={props.status.id}>
      <h2>
        {props.status.display_name} ({props.tasks.length})
      </h2>
      <section>
        <For
          each={
            props.status.id === "opened"
              ? orderBy(props.tasks, (task) => {
                  const priorityLabel = task.labels
                    ?.find((label: string) => label.includes("priority"))
                    ?.toLowerCase();
                  if (priorityLabel?.includes("high")) return 1;
                  if (priorityLabel?.includes("medium")) return 2;
                  if (priorityLabel?.includes("low")) return 3;
                  return 4;
                })
              : props.tasks
          }
        >
          {(task, taskIndex) => (
            <TaskCard
              task={task}
              isSelected={
                keyboardNavigationStore.selectedColumnIndex ===
                  props.columnIndex &&
                (keyboardNavigationStore.selectedTaskIndex === taskIndex() ||
                  keyboardNavigationStore.selectedTaskIndexes.includes(
                    taskIndex(),
                  ))
              }
              onClick={() => {
                setSelectedTaskForModal(task);
                setActiveModal(ModalType.TaskDetails);
              }}
              taskIndex={taskIndex()}
              setTaskRef={(el) => (taskRefs[taskIndex()] = el)}
              commentsCount={
                task.discussions?.filter(
                  (item) =>
                    !item.notes?.some((note) => note.system) &&
                    !item.notes?.some((note) => note.resolved) &&
                    item.notes?.some((note) =>
                      note.body.includes(`@${uiStore.user?.username}`),
                    ),
                ).length || 0
              }
            />
          )}
        </For>
      </section>
    </div>
  );
};

export default TaskColumn;
