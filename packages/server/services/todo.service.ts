import { GitlabClient } from "@server/clients/gitlab.v2.client.ts";
import type { GitlabTodo } from "shared/types/gitlab";

export class TodoService {
  private _gitlabClient: GitlabClient;

  constructor() {
    this._gitlabClient = new GitlabClient();
  }

  getAll = async () => {
    return await this._gitlabClient.get<GitlabTodo[]>("/todos?per_page=100");
  };

  markDone = async (id: number) => {
    await this._gitlabClient.post(`/todos/${id}/mark_as_done`);
  };
}
