import { createEffect, For, Index } from "solid-js";

import styles from "./TaskColumn.module.css";
import { keyboardNavigationStore } from "../../../stores/keyboardNavigationStore";
import {
  setSelectedTaskForModal,
  setActiveModal,
  ModalType,
} from "../../../stores/modalStore";
import TaskCard from "../TaskCard/TaskCard";
import { Task } from "../../../stores/taskStore";
import { orderBy } from "lodash";

interface TaskColumnProps {
  status: { display_name: string; id: string };
  tasks: Task[];
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
                    .find((label) => label.includes("priority"))
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
                    taskIndex()
                  ))
              }
              onClick={() => {
                setSelectedTaskForModal(task);
                setActiveModal(ModalType.TaskDetails);
              }}
              taskIndex={taskIndex()}
              setTaskRef={(el) => (taskRefs[taskIndex()] = el)}
              commentsCount={
                task.comments.filter(
                  (item) =>
                    !item.system &&
                    !item.resolved &&
                    item.body.includes("@maxi")
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
