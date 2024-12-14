import BaseRepo from "./baseRepo.js";
import { Project, type IProject } from "../models/project.js";

export class ProjectRepo extends BaseRepo<IProject> {
  constructor() {
    super(Project);
  }
}
