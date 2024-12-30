import axios from "axios";
import { createStore } from "solid-js/store";

export const [todoStore, setTodoStore] = createStore({
  todos: [] as any[],
});

export const fetchTodosAsync = async () => {
  const response = await axios.get("/git/todos");

  setTodoStore("todos", response.data);

  return response.data;
};
