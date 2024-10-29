import { onCleanup, onMount } from "solid-js";
import Header from "./components/Header/Header";
import TaskColumn from "./components/TaskColumn/TaskColumn";
import {
  createTaskAsync,
  deleteTaskAsync,
  updateTaskAsync,
} from "./services/taskService";
import { STATES } from "./constants";
import { handleKeyDown } from "./services/keyboardShortcutHandler";
import TaskDetailsModal from "./components/modals/TaskDetailsModal/TaskDetailsModal";
import {
  HelpModal,
  DeleteModal,
  EditOrCreateTaskModal,
} from "./components/modals";
import NotificationManager from "./components/NotificationManager";
import { addNotification } from "./services/notificationService";
import { fetchTasksAsync, filteredTasks } from "./stores/taskStore";
import {
  handleCloseModal,
  modalStore,
  ModalType,
  setActiveModal,
  setSelectedTaskForModal,
} from "./stores/modalStore";
import styles from "./App.module.css";

const App = () => {
  const handleCreateOrUpdateTask = async () => {
    try {
      if (!modalStore.selectedTask) return;

      if (modalStore.selectedTask!._id) {
        await updateTaskAsync(
          modalStore.selectedTask!._id,
          modalStore.selectedTask!
        );
      } else {
        await createTaskAsync(modalStore.selectedTask!);
      }
      await fetchTasksAsync();
      setSelectedTaskForModal(null);
      setActiveModal(ModalType.None);

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
  };

  const handleDeleteTask = async () => {
    try {
      await deleteTaskAsync(modalStore.selectedTask?._id || "");
      await fetchTasksAsync();
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

  const keydownHandler = (event: KeyboardEvent) => handleKeyDown(event);

  onMount(async () => {
    window.addEventListener("keydown", keydownHandler);
    await fetchTasksAsync();
  });

  onCleanup(() => {
    window.removeEventListener("keydown", keydownHandler);
  });

  return (
    <div>
      <Header
        onToggleCreateTask={() => {
          if (modalStore.activeModal === ModalType.CreateTask) {
            setActiveModal(ModalType.None);
          } else {
            setActiveModal(ModalType.CreateTask);
          }
        }}
        showCreateTask={modalStore.activeModal === ModalType.CreateTask}
      />
      <NotificationManager />
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
      {modalStore.activeModal === ModalType.Help && (
        <HelpModal onClose={handleCloseModal} />
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
    </div>
  );
};

export default App;
