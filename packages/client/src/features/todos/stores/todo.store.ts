import { getTodos, markAsDone } from "@client/features/todos/services/todo.service";
import { addNotification } from "@client/services/notificationService.ts";
import { createBaseStore } from "@client/stores/baseStore.ts";
import { LoadingTarget } from "@client/stores/uiStore";
import type { GitlabTodo } from "shared/types/gitlab/todo.ts";

interface TodoState {
  todos: GitlabTodo[];
  lastFetched: Date | null;
}

const {
  store: todoStore,
  setStore: setTodoStore,
  run,
} = createBaseStore<TodoState>({
  todos: [],
  lastFetched: null,
});

export { todoStore };

export const fetchTodos = async () => {
  await run(
    async () => {
      const todos = await getTodos();
      setTodoStore({
        todos,
        lastFetched: new Date(),
      });

      return todos;
    },
    {
      action: "fetchTodos",
      loadingTarget: LoadingTarget.Todos,
    },
  );
};

export const markTodoDone = async (id: number) => {
  await run(
    async () => {
      await markAsDone(id);

      setTodoStore({
        todos: todoStore.todos.map((todo) =>
          todo.id === id ? { ...todo, state: "done" } : todo,
        ),
      });

      addNotification({
        title: "Todo marked as done",
        description: `Todo has been marked as done.`,
        type: "success",
      });
    },
    {
      showError: true,
    },
  );
};

export const sortedTodos = () => {
  return todoStore.todos
    .filter((item) => item.state === "pending")
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
};
