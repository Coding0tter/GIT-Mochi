import axios from "axios";

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

export const getUserAsync = async () => {
  try {
    const userResponse = await axios.get(`/git/user`);
    return userResponse.data;
  } catch (error) {
    return null;
  }
};
