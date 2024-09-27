import { createSignal, onCleanup, onMount } from "solid-js";
import Header from "./components/Header";
import TaskColumn from "./components/TaskColumn";
import DeleteModal from "./components/modals/DeleteModal";
import {
  fetchTasksAsync,
  createTaskAsync,
  deleteTaskAsync,
  syncGitLabAsync,
  Task,
  updateTaskAsync,
} from "./services/taskService";
import { STATES } from "./constants";
import { handleKeyDown } from "./services/navigationHandler";
import TaskDetailsModal from "./components/modals/TaskDetailsModal";
import HelpModal from "./components/modals/HelpModal";
import NotificationManager from "./components/NotificationManager";
import { addNotification } from "./services/notificationService";
import EditOrCreateTaskModal from "./components/modals/EditOrCreateTaskModal";
import { CommandHandler } from "./services/commandHandler";

export enum ModalType {
  CreateTask,
  DeleteTask,
  TaskDetails,
  Help,
  None,
}

export enum InputMode {
  None,
  Search,
  Commandline,
}

const App = () => {
  const [tasks, setTasks] = createSignal<Task[]>([]);
  const [loading, setLoading] = createSignal(false);
  const [editTask, setEditTask] = createSignal<Task | null>(null);
  const [closingModal, setClosingModal] = createSignal(false);
  const [searchRef, setSearchRef] = createSignal<HTMLInputElement | null>(null);
  const [searchQuery, setSearchQuery] = createSignal("");
  const [inputMode, setInputMode] = createSignal(InputMode.None);

  const [showDeletedTasks, setShowDeletedTasks] = createSignal(false);

  const [activeModal, setActiveModal] = createSignal(ModalType.None);

  const [selectedTaskForDetails, setSelectedTaskForDetails] =
    createSignal<Task | null>(null);
  const [selectedTaskForDeletion, setSelectedTaskForDeletion] =
    createSignal<Task | null>(null);
  const [selectedTaskIndex, setSelectedTaskIndex] = createSignal<number>(0);
  const [selectedColumnIndex, setSelectedColumnIndex] = createSignal<number>(0);

  const loadTasksAsync = async (showDeleted = false) => {
    try {
      const data = await fetchTasksAsync(showDeleted);
      setTasks(data);
      return data;
    } catch (error) {
      addNotification({
        title: "Error",
        description: "Failed to load tasks",
        type: "error",
      });
    }
  };

  const toggleShowDeleted = async () => {
    setLoading(true);
    await loadTasksAsync(!showDeletedTasks());
    setShowDeletedTasks((prev) => !prev);
    setLoading;
  };

  const handleCreateTask = async () => {
    try {
      if (!editTask()) return;

      if (editTask()!._id) {
        await updateTaskAsync(editTask()!._id, editTask()!);
      } else {
        await createTaskAsync(editTask()!);
      }
      await loadTasksAsync();
      setEditTask(null);
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
      await deleteTaskAsync(selectedTaskForDeletion()?._id || "");
      await loadTasksAsync();
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

  const handleCloseModal = () => {
    setClosingModal(true);
    setTimeout(() => {
      setActiveModal(ModalType.None);
      setEditTask(null);
      setClosingModal(false);
    }, 300);
  };

  const commandHandler = new CommandHandler({
    tasks,
    selectedColumnIndex,
    selectedTaskIndex,
    setLoading,
    setSelectedColumnIndex,
    setSelectedTaskIndex,
    loadTasksAsync: loadTasksAsync as () => Promise<Task[]>,
    setSelectedTaskForDeletion,
    setActiveModal,
    setSelectedTaskForDetails,
    setEditTask,
    handleCloseModal,
    setInputMode,
    toggleShowDeleted,
    searchRef,
  });

  const keydownHandler = (event: KeyboardEvent) =>
    handleKeyDown(event, activeModal(), commandHandler);

  onMount(async () => {
    await loadTasksAsync();

    window.addEventListener("keydown", keydownHandler);
  });

  onCleanup(() => {
    window.removeEventListener("keydown", keydownHandler);
  });

  return (
    <div>
      <Header
        loading={loading()}
        onSync={async () => {
          setLoading(true);
          await syncGitLabAsync();
          await loadTasksAsync();
          setLoading(false);
        }}
        inputMode={inputMode()}
        onToggleCreateTask={() => {
          if (activeModal() === ModalType.CreateTask) {
            setActiveModal(ModalType.None);
          } else {
            setActiveModal(ModalType.CreateTask);
          }
        }}
        showCreateTask={activeModal() === ModalType.CreateTask}
        onSearch={(query) => {
          setSearchQuery(query);
        }}
        setSearchRef={(ref) => setSearchRef(ref)}
        commandHandler={commandHandler}
      />
      <NotificationManager />
      {activeModal() === ModalType.CreateTask && (
        <EditOrCreateTaskModal
          task={editTask()}
          onSubmit={handleCreateTask}
          onClose={handleCloseModal}
          closing={closingModal()}
        />
      )}
      {activeModal() === ModalType.DeleteTask && (
        <DeleteModal
          task={selectedTaskForDeletion()}
          onSubmit={handleDeleteTask}
          onClose={handleCloseModal}
          closing={closingModal()}
        />
      )}
      {activeModal() === ModalType.TaskDetails && (
        <TaskDetailsModal
          task={selectedTaskForDetails()}
          onClose={handleCloseModal}
          closing={closingModal()}
        />
      )}
      {activeModal() === ModalType.Help && (
        <HelpModal onClose={handleCloseModal} closing={closingModal()} />
      )}
      <div class="kanban">
        {STATES.map((status, columnIndex) => (
          <TaskColumn
            status={status}
            tasks={tasks()
              .filter((task) => task.status === status.id)
              .filter(
                (task) =>
                  task.title
                    .toLowerCase()
                    .includes(searchQuery().toLowerCase()) ||
                  task.labels.some((label) =>
                    label.toLowerCase().includes(searchQuery().toLowerCase())
                  ) ||
                  task.branch?.toString().includes(searchQuery())
              )}
            selectedTaskIndex={selectedTaskIndex()}
            selectedColumnIndex={selectedColumnIndex()}
            columnIndex={columnIndex}
            setSelectedTaskIndex={setSelectedTaskIndex}
            setSelectedColumnIndex={setSelectedColumnIndex}
            setSelectedTaskForDetails={setSelectedTaskForDetails}
            setShowTaskDetailsModal={() =>
              setActiveModal(ModalType.TaskDetails)
            }
          />
        ))}
      </div>
    </div>
  );
};

export default App;
