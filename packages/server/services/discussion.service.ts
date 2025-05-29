import { DiscussionRepo } from "@server/repositories/discussion.repo";
import type { IDiscussion } from "shared/types/task";
import { MochiError } from "../errors/mochi.error";
import { BaseService } from "./base.service";

export class DiscussionService extends BaseService<IDiscussion> {
  constructor() {
    super(new DiscussionRepo(), "Discussion");
  }

  async getDiscussionsByTaskId(id: string) {
    try {
      return await super.getAllAsync({ taskId: id });
    } catch (error: any) {
      throw new MochiError("Error fetching discussions", 500, error);
    }
  }

  async upsertDiscussion(discussion: IDiscussion, taskId: string) {
    if (!discussion || !taskId) {
      throw new MochiError("Invalid discussion or task ID", 400);
    }

    const existing = await this.repository.findOneAsync({
      discussionId: discussion.discussionId,
    });

    if (existing) {
      if (existing.notes?.length !== discussion.notes?.length) {
        existing.set({
          notes: discussion.notes,
        });
      }
    } else {
      super.createAsync({
        ...discussion,
        taskId,
      });
    }
  }

  async deleteDiscussionAsync(id: string) {
    try {
      return super.deleteAsync(id);
    } catch (error: any) {
      throw new MochiError("Error deleting rule", 500, error);
    }
  }
}
