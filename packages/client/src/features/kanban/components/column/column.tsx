import TaskCard from "@client/features/kanban/components/card/card.tsx";
import {
  getTasksByState,
  kanbanStore,
} from "@client/features/kanban/stores/kanban.store.ts";
import { keyboardNavigationStore } from "@client/shared/stores/keyboard-navigation.store.ts";
import { SortableProvider, createDroppable } from "@thisbeyond/solid-dnd";
import { Index, Show, createMemo } from "solid-js";
import styles from "./column.module.css";

type ColumnProps = {
  id: string;
  title: string;
  activeId: string | null;
  overId: string | null;
};

const TaskColumn = (props: ColumnProps) => {
  const tasks = createMemo(() => getTasksByState(props.id));

  const droppable = createDroppable(props.id);
  const ids = () => tasks().map((t) => t.id.toString());

  const placeholderIndex = createMemo(() => {
    if (!props.activeId || !props.overId) return null;

    const overTaskIndex = tasks().findIndex(
      (t) => t.id.toString() === props.overId,
    );
    if (overTaskIndex !== -1) {
      if (props.overId === props.activeId) return null;
      return overTaskIndex;
    }

    if (props.overId === props.id) {
      return tasks().length;
    }

    return null;
  });

  return (
    <div class={styles.column}>
      <h2>
        {props.title} ({tasks().length})
      </h2>
      <div
        ref={droppable}
        class={styles.list}
        classList={{
          [styles.droppable]: droppable.isActiveDroppable,
        }}
      >
        <SortableProvider ids={ids()}>
          <Index each={tasks()}>
            {(task, index) => {
              const isBeingDragged = () =>
                task().id.toString() === props.activeId;
              return (
                <>
                  <Show when={placeholderIndex() === index}>
                    <div class={styles.placeholder} />
                  </Show>
                  <div classList={{ [styles.ghost]: isBeingDragged() }}>
                    <TaskCard
                      id={task().id.toString()}
                      task={task()}
                      active={
                        keyboardNavigationStore.rowIndex === index &&
                        keyboardNavigationStore.columnIndex ===
                          kanbanStore.columns.findIndex(
                            (col) => col.id === props.id,
                          )
                      }
                    />
                  </div>
                </>
              );
            }}
          </Index>
          <Show when={placeholderIndex() === tasks().length}>
            <div class={styles.placeholder} />
          </Show>
        </SortableProvider>
      </div>
    </div>
  );
};

export default TaskColumn;
