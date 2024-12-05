import { onMount } from "solid-js";
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
  setActiveModal,
  setSelectedTaskForModal,
} from "../../stores/modalStore";
import { fetchTasksAsync, filteredTasks } from "../../stores/taskStore";
import styles from "./KanbanBoard.module.css";
import TaskColumn from "../../components/Kanban/TaskColumn/TaskColumn";
import { keyboardNavigationStore } from "../../stores/keyboardNavigationStore";
import PipelineModal from "../../components/modals/PipelineModal/PipelineModal";

const KanbanBoard = () => {
  onMount(async () => {
    await fetchTasksAsync();
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
      setActiveModal(ModalType.None);
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
      setActiveModal(ModalType.None);

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
      {modalStore.activeModal === ModalType.CreateTask && (
        <EditOrCreateTaskModal
          onSubmit={handleCreateOrUpdateTask}
          onClose={handleCloseModal}
        />
      )}
      {modalStore.activeModal === ModalType.DeleteTask && (
        <DeleteModal onSubmit={handleDeleteTask} onClose={handleCloseModal} />
      )}
      {modalStore.activeModal === ModalType.TaskDetails && (
        <TaskDetailsModal onClose={handleCloseModal} />
      )}
      {modalStore.activeModal === ModalType.Pipeline && (
        <PipelineModal onClose={handleCloseModal} />
      )}
      <div class={styles.kanban}>
        {STATES.map((status, columnIndex) => (
          <TaskColumn
            status={status}
            tasks={filteredTasks().filter((task) => task.status === status.id)}
            columnIndex={columnIndex}
          />
        ))}
      </div>
    </>
  );
};

export default KanbanBoard;
