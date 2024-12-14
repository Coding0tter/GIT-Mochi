import mongoose from "mongoose";
import { logError } from "../utils/logger";
import { MochiError } from "../errors/mochiError";

export function transactional(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    const session = await mongoose.startSession();

    session.startTransaction();

    try {
      const result = await originalMethod.apply(this, [...args, session]);

      await session.commitTransaction();
      session.endSession();

      return result;
    } catch (error: any) {
      await session.abortTransaction();
      session.endSession();

      logError(new MochiError(`Error in ${propertyKey}`, 500, error));
      throw error;
    }
  };
}
