import Badge from "@client/components/shared/Badge/Badge";
import Tooltip from "@client/components/shared/Tooltip/Tooltip";
import type { ITask } from "shared/types/task";
import { Show } from "solid-js";
import styles from "./TaskCard.module.css";

interface TaskCardProps {
  task: Partial<ITask>;
  isSelected: boolean;
  onClick: () => void;
  taskIndex: number;
  setTaskRef: (el: HTMLElement) => void;
  commentsCount: number;
}

const TaskCard = (props: TaskCardProps) => {
  const getPriorityLabel = (task: Partial<ITask>) => {
    const label = task.labels?.find((item: string) =>
      item.toLowerCase().includes("priority")
    );

    if (label) {
      return label.split("priority/")[1].toLowerCase();
    }

    return "";
  };

  const getIcon = (status: string) => {
    switch (status) {
      case "success":
        return <i class="fa-regular fa-thumbs-up"></i>;
      case "failed":
        return <i class="fa-regular fa-thumbs-down"></i>;
      case "running":
        return <i class="fa-solid fa-person-running"></i>;
      case "canceled":
        return <i class="fa-solid fa-person-running"></i>;
      case "skipped":
        return <i class="fa-solid fa-forward"></i>;
      default:
        return <i class="fa-solid fa-question-circle"></i>;
    }
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
      style={{
        "view-transition-name": "card-" + props.task._id,
      }}
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
        <Badge clipBoardText={props.task.branch} hasTooltip cutOffText>
          Branch: {props.task.branch}
        </Badge>
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

      <Show when={props.task.pipelineStatus !== undefined}>
        <div
          class={`${styles.pipelineStatus} ${
            styles[props.task.pipelineStatus!]
          }`}
        >
          <Tooltip text={props.task.pipelineStatus}>
            {getIcon(props.task.pipelineStatus!)}
          </Tooltip>
        </div>
      </Show>
    </div>
  );
};

export default TaskCard;
