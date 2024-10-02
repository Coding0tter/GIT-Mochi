import { createEffect, createSignal, For } from "solid-js";
import TaskCard from "./TaskCard";
import { keyboardNavigationStore } from "../stores/keyboardNavigationStore";
import { Task } from "../stores/taskStore";
import {
  ModalType,
  setActiveModal,
  setSelectedTaskForModal,
} from "../stores/modalStore";

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
      }, 0);
    }
  });

  return (
    <div class="column" data-status={props.status.id}>
      <h2>{props.status.display_name}</h2>
      <section>
        <For each={props.tasks}>
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
                  (item) => !item.resolved && item.body.includes("@maxi")
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
