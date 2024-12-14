import BaseRepo from "./baseRepo.js";
import { User, type IUser } from "../models/user.js";

export class UserRepo extends BaseRepo<IUser> {
  constructor() {
    super(User);
  }
}
