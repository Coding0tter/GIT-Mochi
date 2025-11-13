import { mochiClient } from "@client/api/mochi/mochiClient.ts";

export const getTest = async () => {
  const { data } = await mochiClient.get("/safe");
  return data;
};

export const getUser = async () => {
  const { data } = await mochiClient.get("/safe/user");
  return data;
};
