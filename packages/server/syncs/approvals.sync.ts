import { MochiError } from "@server/errors/mochi.error.ts";
import { TaskV2 } from "@server/models/task.model.v2.ts";
import { User } from "@server/models/user.model.ts";
import { TaskRepoV2 } from "@server/repositories/task.repo.v2.ts";
import { GitlabServiceV2 } from "@server/services/gitlab.service.v2.ts";
import {
  asyncLocalStorage,
  ContextKeys,
  setContext,
} from "@server/utils/asyncContext.ts";
import { logInfo, logError } from "@server/utils/logger.ts";

export class ApprovalsSync {
  private _taskRepo = new TaskRepoV2();
  private _gitlabService = new GitlabServiceV2();

  async sync() {
    return asyncLocalStorage.run(new Map(), async () => {
      logInfo("Starting Approvals Sync...");

      const adminUser = await User.findOne({ isAdmin: true });

      if (!adminUser || !adminUser.gitlabToken?.access_token) {
        throw new MochiError(
          "No admin user with GitLab token found to perform sync",
          500,
        );
      }

      setContext(ContextKeys.GitlabToken, adminUser.gitlabToken.access_token);

      const mergeRequests = await this._taskRepo.getMergeRequests();

      const relevantMRs = mergeRequests.filter((mr) =>
        mr.reviewers.some((r) => r.state !== "approved"),
      );

      if (!relevantMRs.length) {
        logInfo("Approvals Sync: no relevant merge requests found");
        return;
      }

      const ops = (
        await Promise.all(
          relevantMRs.map(async (mr) => {
            try {
              const reviews = await this._gitlabService.getReviewerStates(
                mr.iid,
              );

              return {
                updateOne: {
                  filter: { "merge_requests.iid": mr.iid },
                  update: {
                    $set: {
                      "merge_requests.$.reviewers": reviews.map((review) => ({
                        ...review.user,
                        state: review.state,
                      })),
                    },
                  },
                },
              };
            } catch (err) {
              logError(
                new MochiError(
                  `Approvals Sync: failed to sync MR ${mr.iid}: ${
                    err instanceof Error ? err.message : String(err)
                  }`,
                ),
              );
              return null;
            }
          }),
        )
      ).filter(Boolean) as Parameters<typeof TaskV2.collection.bulkWrite>[0];

      if (!ops.length) {
        logInfo("Approvals Sync: no updates to apply");
        return;
      }

      await TaskV2.collection.bulkWrite(ops);
      logInfo(`Approvals Sync: applied ${ops.length} updates`);
    });
  }
}
