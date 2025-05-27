import Badge from "@client/components/shared/Badge/Badge";
import Tooltip from "@client/components/shared/Tooltip/Tooltip";
import type { ITask } from "shared/types/task";
import { Show } from "solid-js";
import styles from "./TaskCard.module.css";
import xMasHat from "@client/assets/xmas.png";
import dayjs from "dayjs";
import { random } from "shared/utils/random";

interface TaskCardProps {
  task: Partial<ITask>;
  isSelected: boolean;
  onClick: () => void;
  taskIndex: number;
  setTaskRef: (el: HTMLElement) => void;
}

const TaskCard = (props: TaskCardProps) => {
  const getPriorityLabel = (task: Partial<ITask>) => {
    const label = task.labels?.find((item: string) =>
      item.toLowerCase().includes("priority"),
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
      case "pending":
        return <i class="fa-solid fa-person-running"></i>;
      case "canceled":
        return <i class="fa-solid fa-stop"></i>;
      case "skipped":
        return <i class="fa-solid fa-forward"></i>;
      default:
        break;
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

      <div class={styles.information}>
        <Show when={props.task.assignee}>
          <img src={props.task.assignee?.avatar_url} class={styles.avatar} />
        </Show>
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
        {props.task.relevantDiscussionCount &&
          props.task.relevantDiscussionCount > 0 && (
            <div class={styles.commentCount}>
              {props.task.relevantDiscussionCount}
            </div>
          )}
      </div>

      <Show
        when={
          props.task.pipelineStatus !== undefined &&
          getIcon(props.task.pipelineStatus)
        }
      >
        <div
          class={`${styles.pipelineStatus} ${
            styles[props.task.pipelineStatus!]
          }`}
        >
          <Tooltip text={props.task.pipelineStatus}>
            <div style={{ display: "none" }}>{props.task.pipelineStatus}</div>
            <>{getIcon(props.task.pipelineStatus!)}</>
          </Tooltip>
        </div>
      </Show>

      <Show
        when={dayjs().month() === 11 && random(props.task?._id || "") > 0.6}
      >
        <img src={xMasHat} class={styles.xMasHat} />
      </Show>

      <Show when={props.task.draft}>
        <div class={styles.ribbon}>Draft</div>
      </Show>
    </div>
  );
};

export default TaskCard;
