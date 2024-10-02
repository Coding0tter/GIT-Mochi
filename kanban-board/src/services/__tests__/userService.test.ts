import { describe, expect, test } from "bun:test";
import { useSpies } from "../../../base.test";
import { getUserAsync } from "../userService";

describe("UserService", () => {
  test("should get user", async () => {
    const { getSpy } = useSpies();

    getSpy.mockResolvedValue({ data: { name: "test" } });

    const user = await getUserAsync();

    expect(getSpy).toHaveBeenCalledWith("/git/user");
    expect(user).toEqual({ name: "test" });
  });

  test("should return null if error", async () => {
    const { getSpy } = useSpies();

    getSpy.mockRejectedValue(new Error("test"));

    const user = await getUserAsync();

    expect(getSpy).toHaveBeenCalledWith("/git/user");
    expect(user).toBeNull();
  });
});
