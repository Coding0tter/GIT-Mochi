import type { IUser } from "@server/models/user.model.ts";
import "express-serve-static-core";

declare global {
  namespace Express {
    interface Request {
      user: IUser;
    }
  }
}

export {};
