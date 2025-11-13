import { GitlabClient } from "@server/clients/gitlab.v2.client.ts";

export class UserServiceV2 {
  private _gitlabClient: GitlabClient;

  constructor() {
    this._gitlabClient = new GitlabClient();
  }

  searchUsers = async (search: string) => {
    return await this._gitlabClient.get("/users", {
      params: { search },
    });
  };
}
