import BaseRepo from "./baseRepo";
import { Project, type IProject } from "../models/project.js";

export class ProjectRepo extends BaseRepo<IProject> {
  constructor() {
    super(Project);
  }
}
