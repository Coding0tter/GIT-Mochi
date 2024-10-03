import BaseRepo from "./baseRepo";
import { User, type IUser } from "../models/user.js";

export class UserRepo extends BaseRepo<IUser> {
  constructor() {
    super(User);
  }
}
