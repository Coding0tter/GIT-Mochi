import { mochiClient } from "@client/api/mochi/mochiClient.ts";
import type { GitlabTodo } from "shared/types/gitlab";

export const getTodos = async () => {
  const { data } = await mochiClient.get<GitlabTodo[]>("/todo");
  return data;
};

export const markAsDone = async (id: number) => {
  await mochiClient.put("/todo/done", { id });
};
