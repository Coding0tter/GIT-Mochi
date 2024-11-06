export enum EventTypes {
  Created = "created",
  Updated = "updated",
  Deleted = "deleted",
  Moved = "moved",
  CreateBranch = "createBranch",
}

export enum ActionTypes {
  // Task actions
  Move = "move",
  Restore = "restore",
  Delete = "delete",

  // GitLab actions
  UpdateAssignee = "updateAssignee",
}

export enum EventNamespaces {
  GitLab = "gitlab",
  Task = "task",
}
