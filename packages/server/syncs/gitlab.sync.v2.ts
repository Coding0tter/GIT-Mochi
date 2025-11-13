import { MochiError } from "@server/errors/mochi.error.ts";
import { User } from "@server/models/user.model.ts";
import { TaskRepoV2 } from "@server/repositories/task.repo.v2.ts";
import { GitlabServiceV2 } from "@server/services/gitlab.service.v2.ts";
import { SettingService } from "@server/services/setting.service.v2.ts";
import SocketHandler from "@server/sockets/index.ts";
import {
  asyncLocalStorage,
  ContextKeys,
  setContext,
} from "@server/utils/asyncContext.ts";
import { logInfo } from "@server/utils/logger.ts";
import { SettingKeys } from "shared";
import {
  mapToGitlabIssue,
  type GitlabIssue,
} from "shared/types/gitlab/issue.ts";
import type { GitlabLabel } from "shared/types/gitlab/label.ts";
import {
  mapToGitlabMergeRequest,
  type GitlabMergeRequest,
} from "shared/types/gitlab/merge_request.ts";
import type { ITaskV2 } from "shared/types/task.v2.ts";

export class GitlabSyncV2 {
  name = "Gitlab Sync V2";

  private _gitlabService: GitlabServiceV2;
  private _taskRepo: TaskRepoV2;
  private _settingService: SettingService;

  constructor() {
    this._gitlabService = new GitlabServiceV2();
    this._settingService = new SettingService();
    this._taskRepo = new TaskRepoV2();
  }

  async sync(fullSync?: boolean, userId?: number): Promise<ITaskV2[]> {
    return await asyncLocalStorage.run(new Map(), async () => {
      logInfo("Starting Gitlab Sync V2...");

      const admin_user = await User.findOne({ isAdmin: true });

      if (!admin_user) {
        throw new MochiError("No admin user found to perform sync", 500);
      }

      setContext(ContextKeys.GitlabToken, admin_user.gitlabToken.access_token);

      const issues = await this._gitlabService.fetchIssues({
        fullSync,
        userId,
      });

      const merge_requests = await this._gitlabService.fetchMergeRequests({
        fullSync,
        userId,
      });

      let tasks = await this._buildTasks(issues);

      const closedTasks = new Set(
        tasks
          .filter((t) => t.state === "closed" || t.state === "merged")
          .map((t) => t.iid),
      );

      if (merge_requests.length !== 0) {
        tasks = tasks.concat(
          await this._updateMergeRequests(
            issues.map((item) => item.iid),
            merge_requests,
          ),
        );
      }

      const upsertedTasks = await this._taskRepo.upsertMany(tasks);

      if (closedTasks.size) {
        await this._taskRepo.softDeleteTasks(closedTasks);
      }

      logInfo(`Gitlab Sync V2 completed. Processed ${tasks.length} tasks.`);

      if (tasks.length) {
        SocketHandler.getInstance()
          .getIO()
          .emit("tasks.changed", upsertedTasks);
      }

      return tasks;
    });
  }

  private async _buildTasks(issues: GitlabIssue[]): Promise<ITaskV2[]> {
    const tasks: ITaskV2[] = [];

    const columnLabels = await this._settingService.getSettingByKey<
      Record<string, GitlabLabel>
    >(SettingKeys.COLUMN_LABELS);

    const columnEntries = Object.entries(columnLabels || {});

    await Promise.all(
      issues.map(async (issue) => {
        const relatedMergeRequest =
          await this._gitlabService.fetchRelatedMergeRequests(issue.iid);

        const matchedLabel = columnEntries.find(([, label]) =>
          issue.labels.includes(label.name),
        );

        const matchedStatus = matchedLabel?.[0] ?? "opened";

        tasks.push({
          ...mapToGitlabIssue(issue),
          merge_requests: relatedMergeRequest.map((mr) =>
            mapToGitlabMergeRequest(mr),
          ),
          status: matchedStatus,
          order: 0,
          notify: true,
          deleted: issue.state === "closed",
        });
      }),
    );

    return tasks;
  }

  private async _updateMergeRequests(
    alreadyCheckedIids: number[],
    mergeRequests: GitlabMergeRequest[],
  ) {
    const alreadyChecked = new Set(alreadyCheckedIids);

    const referenceRegex = /Closes #(\d+)"/g;

    const referenceIids = Array.from(
      new Set(
        mergeRequests.flatMap((mr) =>
          Array.from(mr.description?.matchAll(referenceRegex) ?? [])
            .map((m) => Number(m[1]))
            .filter(
              (iid): iid is number =>
                iid !== null && !Number.isNaN(iid) && !alreadyChecked.has(iid),
            ),
        ),
      ),
    );

    if (!referenceIids.length) return this._buildTasks([]);

    const issues = await Promise.all(
      referenceIids.map((iid) => this._gitlabService.fetchIssueByIid(iid)),
    );

    logInfo(`Updating ${issues.length} issues from merge requests...`);

    return this._buildTasks(issues);
  }
}
