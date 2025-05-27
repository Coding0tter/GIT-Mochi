// services/UserService.ts
import { UserRepo } from "../repositories/user.repo";
import type { IUser } from "../models/user.model";

export class UserService {
  private userRepo: UserRepo;

  constructor() {
    this.userRepo = new UserRepo();
  }

  async getUser(): Promise<IUser | null> {
    return this.userRepo.findOneAsync({});
  }

  async createUser(userData: Partial<IUser>): Promise<IUser> {
    return this.userRepo.createAsync(userData);
  }
}
