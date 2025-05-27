import BaseRepo from "./base.repo.js";
import { Project, type IProject } from "../models/project.model.js";

export class ProjectRepo extends BaseRepo<IProject> {
  constructor() {
    super(Project);
  }
}
