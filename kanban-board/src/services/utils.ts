import { BACKEND_URL } from "../constants";

export interface Comment {
  id: number;
  body: string;
  resolved: boolean;
  author: {
    name: string;
    username: string;
  };
  system: boolean;
}

export const getUser = async () => {
  try {
    const userResponse = await fetch(`${BACKEND_URL}/git/user`);
    return userResponse.json();
  } catch (error) {
    console.error("Error getting user:", error);
    return;
  }
};
