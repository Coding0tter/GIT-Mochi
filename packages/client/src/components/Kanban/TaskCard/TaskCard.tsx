import xMasHat from "@client/assets/xmas.png";
import Badge from "@client/components/shared/Badge/Badge";
import Tooltip from "@client/components/shared/Tooltip/Tooltip";
import { orderPriorityLabels } from "@client/utils/orderLabels";
import dayjs from "dayjs";
import type { ITask } from "shared/types/task";
import { random } from "shared/utils/random";
import { Show, createSignal } from "solid-js";
import { createDraggable } from "@thisbeyond/solid-dnd";
import styles from "./TaskCard.module.css";

interface TaskCardProps {
  task: Partial<ITask>;
  isSelected: boolean;
  onClick: () => void;
  taskIndex: number;
  setTaskRef: (el: HTMLElement) => void;
  columnIndex?: number;
}

const TaskCard = (props: TaskCardProps) => {
  const [isHovering, setIsHovering] = createSignal(false);

  const draggable = createDraggable(
    props.task._id || `task-${props.taskIndex}`,
    {
      task: props.task,
      taskIndex: props.taskIndex,
      columnIndex: props.columnIndex,
    },
  );

  const getPriorityLabel = (task: Partial<ITask>) => {
    const labels = orderPriorityLabels(task.labels ?? []);

    if (labels) {
      return labels.at(0)?.split("priority/")[1].toLowerCase();
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
      //@ts-ignore
      use:draggable
      style={{
        "view-transition-name": "card-" + props.task._id,
      }}
      class={`${styles.task} ${props.isSelected ? styles.selectedTask : ""} ${
        props.task.custom ? styles.customTask : ""
      } ${props.task.deleted ? styles.deletedTask : ""} ${
        styles[props.task.type as string]
      } ${draggable.isActiveDraggable ? styles.dragging : ""}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <Show when={isHovering()}>
        <div class={styles.dragHandle}>
          <i class="fa-solid fa-grip-vertical"></i>
        </div>
      </Show>

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
