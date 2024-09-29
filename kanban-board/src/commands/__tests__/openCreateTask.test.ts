import { describe, expect, test } from "bun:test";
import { openCreateModalSpy } from "../../../base.test";

describe("openCreateTask execute", () => {
  test("should open create task modal", async () => {
    const { execute } = require("../openCreateTask");
    await execute();

    expect(openCreateModalSpy).toHaveBeenCalled();
  });
});
