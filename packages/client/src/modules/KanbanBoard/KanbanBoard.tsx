import { createSignal, onMount, Show } from "solid-js";
import {
  EditOrCreateTaskModal,
  DeleteModal,
  BranchNameModal,
} from "../../components/modals";
import TaskDetailsModal from "../../components/modals/TaskDetailsModal/TaskDetailsModal";
import { STATES } from "../../constants";
import { addNotification } from "../../services/notificationService";
import {
  createTaskAsync,
  deleteTasksAsync,
  updateTaskAsync,
} from "../../services/taskService";
import {
  modalStore,
  ModalType,
  handleCloseModal,
  setSelectedTaskForModal,
  closeModal,
} from "../../stores/modalStore";
import { fetchTasksAsync, filteredTasks } from "../../stores/taskStore";
import styles from "./KanbanBoard.module.css";
import TaskColumn from "../../components/Kanban/TaskColumn/TaskColumn";
import { keyboardNavigationStore } from "../../stores/keyboardNavigationStore";
import PipelineModal from "../../components/modals/PipelineModal/PipelineModal";
import ReplyModal from "../../components/modals/ReplyModal/ReplyModal";
import { uiStore } from "@client/stores/uiStore";
import Loading from "@client/components/shared/Loading/Loading";
import {
  DragDropProvider,
  DragDropSensors,
  useDragDropContext,
  mostIntersecting,
} from "@thisbeyond/solid-dnd";

const KanbanBoard = () => {
  const [loading, setLoading] = createSignal<boolean>(true);

  onMount(async () => {
    setLoading(true);
    await fetchTasksAsync();
    // setLoading(false);
  });

  const handleCreateOrUpdateTask = async () => {
    if (!modalStore.selectedTask) return;

    if (modalStore.selectedTask!._id) {
      try {
        await updateTaskAsync(
          modalStore.selectedTask!._id,
          modalStore.selectedTask!,
        );
        addNotification({
          title: "Success",
          description: "Task updated successfully",
          type: "success",
        });
      } catch (error) {
        addNotification({
          title: "Error",
          description: "Failed to update task",
          type: "error",
        });
      }
    } else {
      try {
        await createTaskAsync(modalStore.selectedTask!);
        addNotification({
          title: "Success",
          description: "Task created successfully",
          type: "success",
        });
      } catch (error) {
        addNotification({
          title: "Error",
          description: "Failed to create task",
          type: "error",
        });
      }
    }
    try {
      await fetchTasksAsync();
      setSelectedTaskForModal(null);
      closeModal(ModalType.CreateTask);
    } catch (error) {
      addNotification({
        title: "Error",
        description: "Failed to fetch tasks",
        type: "error",
      });
    }
  };

  const handleDeleteTask = async () => {
    try {
      await deleteTasksAsync(keyboardNavigationStore.selectedTaskIndexes);
      closeModal(ModalType.DeleteTask);

      addNotification({
        title: "Success",
        description: "Task deleted successfully",
        type: "success",
      });
    } catch (error) {
      addNotification({
        title: "Error",
        description: "Failed to delete task",
        type: "error",
      });
    }
  };

  const KanbanBoardContent = () => {
    //@ts-ignore
    const [, { onDragEnd }] = useDragDropContext();

    //@ts-ignore
    onDragEnd(async ({ draggable, droppable }) => {
      if (!draggable || !droppable) return;

      const dragData = draggable.data as {
        task: { _id?: string };
        columnIndex: number;
      };

      const dropData = droppable.data as {
        columnIndex: number;
        status: { id: string; display_name: string };
      };

      if (dragData.columnIndex === dropData.columnIndex) return;

      try {
        await updateTaskAsync(dragData.task._id!, {
          status: dropData.status.id,
        });
        await fetchTasksAsync();

        addNotification({
          title: "Success",
          description: `Task moved to ${dropData.status.display_name}`,
          type: "success",
        });
      } catch (error) {
        addNotification({
          title: "Error",
          description: "Failed to move task",
          type: "error",
        });
      }
    });

    return (
      <div class={styles.kanban}>
        <Show
          when={uiStore.currentProject}
          fallback={
            <div class={styles.noProject}>
              No project selected. Please select one via the commandline.
            </div>
          }
        >
          {STATES.map((status, columnIndex) => (
            <TaskColumn
              status={status}
              tasks={filteredTasks().filter(
                (task) => task.status === status.id,
              )}
              columnIndex={columnIndex}
            />
          ))}
        </Show>
      </div>
    );
  };

  return (
    <>
      {modalStore.activeModals.includes(ModalType.CreateTask) && (
        <EditOrCreateTaskModal
          onSubmit={handleCreateOrUpdateTask}
          onClose={handleCloseModal}
        />
      )}
      {modalStore.activeModals.includes(ModalType.DeleteTask) && (
        <DeleteModal onSubmit={handleDeleteTask} onClose={handleCloseModal} />
      )}
      {modalStore.activeModals.includes(ModalType.TaskDetails) && (
        <TaskDetailsModal onClose={handleCloseModal} />
      )}
      {modalStore.activeModals.includes(ModalType.Pipeline) && (
        <PipelineModal onClose={handleCloseModal} />
      )}
      {modalStore.activeModals.includes(ModalType.Reply) && (
        <ReplyModal onClose={handleCloseModal} />
      )}
      {modalStore.activeModals.includes(ModalType.BranchName) && (
        <BranchNameModal onClose={handleCloseModal} />
      )}
      <DragDropProvider collisionDetector={mostIntersecting}>
        <DragDropSensors />
        <Show
          when={uiStore.currentProject}
          fallback={
            loading() ? (
              <Loading />
            ) : (
              <div class={styles.noProject}>
                No project selected. Please select one via the commandline.
              </div>
            )
          }
        >
          <KanbanBoardContent />
        </Show>
      </DragDropProvider>
    </>
  );
};

export default KanbanBoard;
