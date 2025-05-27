import BaseRepo from "./base.repo.js";
import { User, type IUser } from "../models/user.model.js";

export class UserRepo extends BaseRepo<IUser> {
  constructor() {
    super(User);
  }
}
