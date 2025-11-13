import { mochiClient } from "@client/api/mochi/mochiClient.ts";

export const getUserSettingByKey = async <T = unknown>(key: string) => {
  const { data } = await mochiClient.get<T>(`/setting/user/${key}`);
  return data;
};

export const setUserSettingByKey = async (key: string, value: any) => {
  const { data } = await mochiClient.put(`/setting/user/${key}`, { value });
  return data;
};

export const getSettingByKey = async <T = unknown>(key: string) => {
  const { data } = await mochiClient.get<T>(`/setting/${key}`);
  return data;
};

export const setSettingByKey = async (key: string, value: any) => {
  const { data } = await mochiClient.put(`/setting/${key}`, { value });
  return data;
};
