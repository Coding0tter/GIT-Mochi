import { Task } from "../stores/taskStore";

interface TaskCardProps {
  task: Task;
  isSelected: boolean;
  onClick: () => void;
  taskIndex: number;
  setTaskRef: (el: HTMLElement) => void;
  commentsCount: number;
}

const TaskCard = (props: TaskCardProps) => {
  const getPriorityLabel = (task: Task) => {
    const label = task.labels.find((item: string) =>
      item.toLowerCase().includes("priority")
    );

    if (label) {
      return label.split("priority/")[1].toLowerCase();
    }

    return false;
  };

  return (
    <div
      onClick={props.onClick}
      ref={props.setTaskRef}
      class={`task ${props.isSelected ? "selected-task" : ""} ${
        props.task.custom ? "custom-task" : ""
      } ${props.task.deleted ? "deleted-task" : ""} ${props.task.type}`}
    >
      <p>{props.task.title}</p>
      {props.task.description && <div class="divider" />}
      <p class="description">{props.task.description}</p>
      {props.task.custom && <span class="custom-flag">Custom</span>}
      {getPriorityLabel(props.task) && (
        <span class={`priority-flag ${getPriorityLabel(props.task)}`}>
          {getPriorityLabel(props.task)}
        </span>
      )}
      {!props.task.custom && props.task.type === "merge_request" && (
        <span title={props.task.branch} class="priority-flag">
          {props.task.branch}
        </span>
      )}
      {!props.task.custom && props.task.type === "issue" && (
        <span title={props.task.milestoneName} class="priority-flag">
          {props.task.milestoneName}
        </span>
      )}
      {props.commentsCount > 0 && (
        <div class="comments-count">{props.commentsCount}</div>
      )}
    </div>
  );
};

export default TaskCard;
