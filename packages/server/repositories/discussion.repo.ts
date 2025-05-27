import { Discussion } from "@server/models/discussion.model";
import type { IDiscussion } from "shared/types/task";
import BaseRepo from "./base.repo";

export class DiscussionRepo extends BaseRepo<IDiscussion> {
  constructor() {
    super(Discussion);
  }
}
