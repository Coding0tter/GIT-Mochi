import { createEffect, createSignal, For } from "solid-js";
import { Task } from "../services/taskService";
import TaskCard from "./TaskCard";

interface TaskColumnProps {
  status: { display_name: string; id: string };
  tasks: Task[];
  selectedTaskIndex: number;
  selectedColumnIndex: number;
  columnIndex: number;
  setSelectedTaskIndex: (index: number) => void;
  setSelectedColumnIndex: (index: number) => void;
  setSelectedTaskForDetails: (task: Task) => void;
  setShowTaskDetailsModal: () => void;
}

const TaskColumn = (props: TaskColumnProps) => {
  let taskRefs: HTMLElement[] = [];

  createEffect(() => {
    if (
      props.selectedColumnIndex === props.columnIndex &&
      taskRefs[props.selectedTaskIndex]
    ) {
      setTimeout(() => {
        taskRefs[props.selectedTaskIndex].scrollIntoView({
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
                props.selectedColumnIndex === props.columnIndex &&
                props.selectedTaskIndex === taskIndex()
              }
              onClick={() => {
                props.setSelectedTaskForDetails(task);
                props.setShowTaskDetailsModal();
              }}
              taskIndex={taskIndex()}
              setTaskRef={(el) => (taskRefs[taskIndex()] = el)}
              commentsCount={
                task.comments.filter((item) => !item.resolved).length || 0
              }
            />
          )}
        </For>
      </section>
    </div>
  );
};

export default TaskColumn;
