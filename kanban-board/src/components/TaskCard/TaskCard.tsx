import { Task } from "../../stores/taskStore";
import Badge from "../Badge/Badge";
import styles from "./TaskCard.module.css";

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

    return "";
  };

  return (
    <div
      onClick={props.onClick}
      ref={props.setTaskRef}
      class={`${styles.task} ${props.isSelected ? styles.selectedTask : ""} ${
        props.task.custom ? styles.customTask : ""
      } ${props.task.deleted ? styles.deletedTask : ""} ${
        styles[props.task.type as string]
      }`}
    >
      <p>{props.task.title}</p>
      {props.task.description && <div class="divider" />}
      <p class={styles.description}>{props.task.description}</p>
      {props.task.custom && <Badge>Custom</Badge>}
      {getPriorityLabel(props.task) && (
        <Badge type={getPriorityLabel(props.task)}>
          {getPriorityLabel(props.task)}
        </Badge>
      )}
      {!props.task.custom && props.task.type === "merge_request" && (
        <Badge>Branch: {props.task.branch}</Badge>
      )}
      {!props.task.custom &&
        props.task.type === "issue" &&
        props.task.milestoneName && <Badge>{props.task.milestoneName}</Badge>}
      {!props.task.custom && props.task.type === "issue" && (
        <Badge>Issue: {props.task.gitlabIid ?? ""}</Badge>
      )}
      {props.commentsCount > 0 && (
        <div class={styles.commentCount}>{props.commentsCount}</div>
      )}
    </div>
  );
};

export default TaskCard;
