import TaskCard from "@client/components/Kanban/TaskCard/TaskCard";
import { keyboardNavigationStore } from "@client/stores/keyboardNavigationStore";
import {
  ModalType,
  openModal,
  setSelectedTaskForModal,
} from "@client/stores/modalStore";
import { uiStore } from "@client/stores/uiStore";
import { orderBy } from "lodash";
import type { ITask } from "shared/types/task";
import { createEffect, For } from "solid-js";
import styles from "./TaskColumn.module.css";

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
        {props.status.display_name} (
        {props.status.id === "opened"
          ? props.tasks.filter(
              (item) => item.assignee?.authorId === uiStore.user?.gitlabId,
            ).length
          : props.tasks.length}
        )
      </h2>
      <section>
        <For
          each={
            props.status.id === "opened"
              ? orderBy(
                  props.tasks.filter(
                    (item) =>
                      item.assignee?.authorId === uiStore.user?.gitlabId,
                  ),
                  (task) => {
                    const priorityLabel = task.labels
                      ?.find((label: string) => label.includes("priority"))
                      ?.toLowerCase();
                    if (priorityLabel?.includes("intermediate")) return 1;
                    if (priorityLabel?.includes("staging")) return 2;
                    if (priorityLabel?.includes("high")) return 3;
                    if (priorityLabel?.includes("medium")) return 4;
                    if (priorityLabel?.includes("low")) return 5;
                    return 6;
                  },
                )
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
                openModal(ModalType.TaskDetails);
              }}
              taskIndex={taskIndex()}
              setTaskRef={(el) => (taskRefs[taskIndex()] = el)}
            />
          )}
        </For>
      </section>
    </div>
  );
};

export default TaskColumn;
