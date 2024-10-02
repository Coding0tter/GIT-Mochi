import { describe, expect, test } from "bun:test";
import { useSpies } from "../../../base.test";

describe("OpenCreateTask Command", () => {
  test("should open create task modal", async () => {
    const { execute } = require("../openCreateTask");
    const { openCreateModalSpy } = useSpies();

    await execute();

    expect(openCreateModalSpy).toHaveBeenCalled();
  });
});
