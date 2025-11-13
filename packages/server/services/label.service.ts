import { GitlabClient } from "@server/clients/gitlab.v2.client.ts";
import type { GitlabLabel } from "shared/types/gitlab/label.ts";

export class LabelService {
  private _gitlabClient: GitlabClient;

  constructor() {
    this._gitlabClient = new GitlabClient();
  }

  searchGitlab = async (search: string, projectId: number) => {
    return await this._gitlabClient.get<GitlabLabel[]>(
      `/projects/${projectId}/labels`,
      {
        params: {
          search,
        },
      },
    );
  };
}
