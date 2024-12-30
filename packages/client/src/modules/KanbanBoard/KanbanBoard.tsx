import { createSignal, onMount, Show } from "solid-js";
import { EditOrCreateTaskModal, DeleteModal } from "../../components/modals";
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
          modalStore.selectedTask!
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
      <div class={styles.kanban}>
        <Show
          when={uiStore.currentProject}
          fallback={
            loading() ? (
              <div class={styles.loading}>
                <div class={styles.dots}>
                  <div class={styles.dot}></div>
                  <div class={styles.dot}></div>
                  <div class={styles.dot}></div>
                </div>
              </div>
            ) : (
              <div class={styles.noProject}>
                No project selected. Please select one via the commandline.
              </div>
            )
          }
        >
          {STATES.map((status, columnIndex) => (
            <TaskColumn
              status={status}
              tasks={filteredTasks().filter(
                (task) => task.status === status.id
              )}
              columnIndex={columnIndex}
            />
          ))}
        </Show>
      </div>
    </>
  );
};

export default KanbanBoard;
