import TaskCard from "@client/components/Kanban/TaskCard/TaskCard";
import { keyboardNavigationStore } from "@client/stores/keyboardNavigationStore";
import {
  ModalType,
  openModal,
  setSelectedTaskForModal,
} from "@client/stores/modalStore";
import { uiStore } from "@client/stores/uiStore";
import { debounce, orderBy } from "lodash";
import type { ITask } from "shared/types/task";
import { createEffect, createSignal, For, Index } from "solid-js";
import styles from "./TaskColumn.module.css";
import { scrollIntoView } from "@client/utils/scrollIntoView";
import { orderPriorityLabels } from "@client/utils/orderLabels";

interface TaskColumnProps {
  status: { display_name: string; id: string };
  tasks: Partial<ITask>[];
  columnIndex: number;
}

const TaskColumn = (props: TaskColumnProps) => {
  const [tasks, setTasks] = createSignal<Partial<ITask>[]>(props.tasks);
  let taskRefs: HTMLElement[] = [];

  createEffect(() => {
    setTasks(getTasks());
  }, [props.tasks]);

  createEffect(() => {
    if (
      keyboardNavigationStore.selectedColumnIndex === props.columnIndex &&
      taskRefs[keyboardNavigationStore.selectedTaskIndex]
    ) {
      const el = taskRefs[keyboardNavigationStore.selectedTaskIndex];
      scrollIntoView(el);
    }
  });

  const getTasks = () => {
    return props.status.id === "opened"
      ? orderBy(
          props.tasks.filter(
            (item) => item.assignee?.authorId === uiStore.user?.gitlabId,
          ),
          (task) => {
            const priorityLabel = orderPriorityLabels(task.labels ?? [])
              .at(0)
              ?.toLowerCase();

            if (priorityLabel?.includes("intermediate")) return 1;
            if (priorityLabel?.includes("staging")) return 2;
            if (priorityLabel?.includes("high")) return 3;
            if (priorityLabel?.includes("medium")) return 4;
            if (priorityLabel?.includes("low")) return 5;
            return 6;
          },
        )
      : props.tasks;
  };

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
        <Index each={tasks()}>
          {(task, taskIndex) => (
            <TaskCard
              task={task()}
              isSelected={
                keyboardNavigationStore.selectedColumnIndex ===
                  props.columnIndex &&
                (keyboardNavigationStore.selectedTaskIndex === taskIndex ||
                  keyboardNavigationStore.selectedTaskIndexes.includes(
                    taskIndex,
                  ))
              }
              onClick={() => {
                setSelectedTaskForModal(task());
                openModal(ModalType.TaskDetails);
              }}
              taskIndex={taskIndex}
              setTaskRef={(el) => {
                taskRefs[tasks().indexOf(task())] = el;
              }}
            />
          )}
        </Index>
      </section>
    </div>
  );
};

export default TaskColumn;
