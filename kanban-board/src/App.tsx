import { createSignal, onCleanup, onMount } from "solid-js";
import Header from "./components/Header";
import TaskColumn from "./components/TaskColumn";
import DeleteModal from "./components/modals/DeleteModal";
import {
  createTaskAsync,
  deleteTaskAsync,
  updateTaskAsync,
} from "./services/taskService";
import { STATES } from "./constants";
import { handleKeyDown } from "./services/navigationHandler";
import TaskDetailsModal from "./components/modals/TaskDetailsModal";
import HelpModal from "./components/modals/HelpModal";
import NotificationManager from "./components/NotificationManager";
import { addNotification } from "./services/notificationService";
import EditOrCreateTaskModal from "./components/modals/EditOrCreateTaskModal";
import { fetchTasksAsync, taskStore } from "./stores/taskStore";
import {
  handleCloseModal,
  modalStore,
  ModalType,
  setActiveModal,
  setSelectedTaskForModal,
} from "./stores/modalStore";
import { InputMode, uiStore } from "./stores/uiStore";

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
      <div class="kanban">
        {STATES.map((status, columnIndex) => (
          <TaskColumn
            status={status}
            tasks={taskStore.tasks
              .filter((task) => task.status === status.id)
              .filter((task) => {
                // Only filter if inputMode is Search
                if (uiStore.inputMode === InputMode.Search) {
                  const searchQuery = uiStore.commandInputValue.toLowerCase();
                  return (
                    task.title.toLowerCase().includes(searchQuery) ||
                    task.labels.some((label) =>
                      label.toLowerCase().includes(searchQuery)
                    ) ||
                    task.branch?.toString().includes(searchQuery)
                  );
                }
                return true; // Don't filter if not in Search mode
              })}
            columnIndex={columnIndex}
          />
        ))}
      </div>
    </div>
  );
};

export default App;
