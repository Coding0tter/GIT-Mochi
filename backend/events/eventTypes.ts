export enum EventTypes {
  Created = "created",
  Updated = "updated",
  Deleted = "deleted",
  Moved = "moved",
  CreateBranch = "createBranch",
}

export enum ActionTypes {
  Move = "move",
  Restore = "restore",
  Delete = "delete",
}

export enum EventNamespaces {
  GitLab = "gitlab",
  Task = "task",
}
