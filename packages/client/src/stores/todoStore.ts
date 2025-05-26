import axios from "axios";
import { createStore } from "solid-js/store";
import { LoadingTarget, setUiStore } from "./uiStore";

export interface GitlabTodo {
  id: number;
  body: string;
  state: "pending" | "done";
  created_at: string;
  updated_at: string;
  target_type: "Issue" | "MergeRequest" | "Epic" | string;
  target: {
    id: number;
    iid: number;
    title: string;
    web_url: string;
    state?: "opened" | "closed" | "merged" | string;
    description?: string;
    labels?: string[];
    milestone?: {
      id: number;
      title: string;
    };
  };
  target_url: string;
  author: {
    id: number;
    name: string;
    username: string;
    avatar_url: string;
    web_url: string;
  };
  project: {
    id: number;
    name: string;
    name_with_namespace: string;
    web_url: string;
    path_with_namespace: string;
  };
  action_name:
    | "assigned"
    | "mentioned"
    | "marked"
    | "approval_required"
    | "review_requested"
    | string;
}

interface TodoStore {
  todos: GitlabTodo[];
  error: string | null;
  lastFetched: Date | null;
}

export const [todoStore, setTodoStore] = createStore<TodoStore>({
  todos: [] as GitlabTodo[],
  error: null,
  lastFetched: null,
});

export const fetchTodosAsync = async () => {
  try {
    setUiStore("loadingTarget", LoadingTarget.Todos);
    setTodoStore("error", null);

    const response = await axios.get<GitlabTodo[]>("/git/todos");

    setTodoStore("todos", response.data);
    setTodoStore("lastFetched", new Date());

    return response.data;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch todos";
    setTodoStore("error", errorMessage);
    console.error("Error fetching todos:", error);
    return [];
  } finally {
    setUiStore("loadingTarget", LoadingTarget.None);
  }
};

export const markTodoAsDoneAsync = async (todoId: number): Promise<boolean> => {
  try {
    // This would require implementing a mark as done endpoint on the backend
    // await axios.post(`/git/todos/${todoId}/mark_as_done`);

    // For now, just update the local state
    setTodoStore("todos", (todos) =>
      todos.map((todo) =>
        todo.id === todoId
          ? {
              ...todo,
              state: "done" as const,
              updated_at: new Date().toISOString(),
            }
          : todo,
      ),
    );

    return true;
  } catch (error) {
    console.error("Error marking todo as done:", error);
    return false;
  }
};
