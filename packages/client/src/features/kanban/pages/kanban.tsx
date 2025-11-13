import { STATES } from "@client/constants.ts";
import TaskColumn from "@client/features/kanban/components/column/column.tsx";
import DetailModal from "@client/features/kanban/components/detail-modal/detail-modal.tsx";
import ReviewModal from "@client/features/kanban/components/review-modal/review-modal.tsx";
import MergeRequestPickerModal from "@client/features/kanban/components/mr-picker-modal/mr-picker-modal.tsx";
import {
  getTasksByState,
  initializeBoard,
  kanbanStore,
  updateColumns,
  updateStatus,
} from "@client/features/kanban/stores/kanban.store";
import { keyboardNavigationStore } from "@client/shared/stores/keyboard-navigation.store.ts";
import {
  ModalType,
  handleCloseModal,
  modalStore,
} from "@client/shared/stores/modal.store.ts";
import {
  DragDropProvider,
  DragDropSensors,
  DragOverlay,
  closestCorners,
  type DragEvent,
} from "@thisbeyond/solid-dnd";
import { For, Show, createEffect, createSignal, onMount } from "solid-js";

const Kanban = () => {
  const [activeId, setActiveId] = createSignal<string | null>(null);
  const [overId, setOverId] = createSignal<string | null>(null);

  onMount(async () => {
    await initializeBoard();
  });

  createEffect(() => {
    const taskId =
      getTasksByState(STATES[keyboardNavigationStore.columnIndex].id)[
        keyboardNavigationStore.rowIndex
      ]?.id ?? null;

    if (taskId) {
      document.getElementById(`task-card-${taskId}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [keyboardNavigationStore.columnIndex, keyboardNavigationStore.rowIndex]);

  const onDragStart = ({ draggable }: DragEvent) => {
    setActiveId(draggable.id as string);
  };

  const onDragOver = ({ droppable }: DragEvent) => {
    setOverId(droppable?.id as string | null);
  };

  const onDragEnd = async ({ draggable, droppable }: DragEvent) => {
    if (draggable && droppable) {
      const draggedId = draggable.id as string;
      const overId = droppable.id as string;

      let sourceColIndex = -1;
      let sourceTaskIndex = -1;
      for (let i = 0; i < kanbanStore.columns.length; i++) {
        const idx = kanbanStore.columns[i].taskIds.indexOf(draggedId);
        if (idx !== -1) {
          sourceColIndex = i;
          sourceTaskIndex = idx;
          break;
        }
      }

      if (sourceColIndex === -1) return kanbanStore.columns;

      let targetColIndex = -1;
      let targetTaskIndex = -1;

      targetColIndex = kanbanStore.columns.findIndex((c) => c.id === overId);

      if (targetColIndex !== -1) {
        targetTaskIndex = kanbanStore.columns[targetColIndex].taskIds.length;
      } else {
        for (let i = 0; i < kanbanStore.columns.length; i++) {
          const idx = kanbanStore.columns[i].taskIds.indexOf(overId);
          if (idx !== -1) {
            targetColIndex = i;
            targetTaskIndex = idx;

            if (sourceColIndex === i && sourceTaskIndex < idx) {
              targetTaskIndex = idx + 1;
            }

            break;
          }
        }
      }

      if (targetColIndex === -1) return kanbanStore.columns;

      const newCols = kanbanStore.columns.map((c) => ({
        ...c,
        taskIds: [...c.taskIds],
      }));

      newCols[sourceColIndex].taskIds.splice(sourceTaskIndex, 1);

      if (
        sourceColIndex === targetColIndex &&
        sourceTaskIndex < targetTaskIndex
      ) {
        targetTaskIndex--;
      }

      newCols[targetColIndex].taskIds.splice(targetTaskIndex, 0, draggedId);

      await updateStatus(
        Number(draggedId),
        kanbanStore.columns[targetColIndex].id,
      );

      updateColumns(newCols);
    }

    setActiveId(null);
    setOverId(null);
  };

  const activeTask = () => {
    const id = activeId();
    return id
      ? kanbanStore.tasks.find((item) => item.id.toString() === id)
      : null;
  };

  return (
    <>
      <DragDropProvider
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        collisionDetector={closestCorners}
      >
        <DragDropSensors />
        <div
          style={{
            display: "flex",
            gap: "16px",
            padding: "16px",
            "align-items": "flex-start",
          }}
        >
          <For each={kanbanStore.columns}>
            {(col) => (
              <TaskColumn
                id={col.id}
                title={col.title}
                activeId={activeId()}
                overId={overId()}
              />
            )}
          </For>
        </div>
        <DragOverlay>
          <Show when={activeTask()}>
            {(task) => (
              <>
                <div
                  style={{
                    padding: "12px",
                    "margin-bottom": "8px",
                    "border-radius": "8px",
                    "max-width": "300px",
                    background: "var(--color-surface1, #2b2f3a)",
                    color: "var(--color-text, #e5e9f0)",
                    "box-shadow": "0 12px 24px rgba(0, 0, 0, 0.4)",
                    cursor: "grabbing",
                    transform: "rotate(3deg)",
                    opacity: "0.95",
                  }}
                >
                  {task().title}
                </div>
              </>
            )}
          </Show>
        </DragOverlay>
      </DragDropProvider>

      <Show when={modalStore.activeModals.includes(ModalType.DetailView)}>
        <DetailModal onClose={handleCloseModal} />
      </Show>

      <Show when={modalStore.activeModals.includes(ModalType.AssignReview)}>
        <ReviewModal onClose={handleCloseModal} />
      </Show>

      <Show when={modalStore.activeModals.includes(ModalType.MrPicker)}>
        <MergeRequestPickerModal
          onClose={handleCloseModal}
          onSelect={(mr) => modalStore.mrPickerCallback?.(mr)}
        />
      </Show>
    </>
  );
};

export default Kanban;
