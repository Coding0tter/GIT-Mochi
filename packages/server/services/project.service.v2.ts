import { GitlabClient } from "@server/clients/gitlab.v2.client.ts";
import type { GitlabProject } from "shared/types/gitlab/project.ts";

export class ProjectServiceV2 {
  private _gitlabClient: GitlabClient;

  constructor() {
    this._gitlabClient = new GitlabClient();
  }

  searchProjects = async (search: string) => {
    return await this._gitlabClient.get<GitlabProject[]>("/projects", {
      params: { search },
    });
  };
}
