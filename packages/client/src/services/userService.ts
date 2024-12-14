import axios from "axios";
import { setUser } from "../stores/uiStore";

export const getUserAsync = async () => {
  try {
    const userResponse = await axios.get(`/git/user`);
    setUser(userResponse.data);
  } catch (error) {
    return null;
  }
};
