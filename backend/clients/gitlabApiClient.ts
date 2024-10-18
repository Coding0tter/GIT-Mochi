import axios from "axios";
import { MochiError } from "../errors/mochiError";

export class GitlabApiClient {
  private readonly baseUrl: string;
  private readonly privateToken: string;

  constructor() {
    this.baseUrl = process.env.GIT_API_URL || "";
    this.privateToken = process.env.PRIVATE_TOKEN || "";
  }

  async request(endpoint: string, method: "GET" | "POST" = "GET", data?: any) {
    try {
      const response = await axios({
        url: `${this.baseUrl}${endpoint}`,
        method,
        headers: {
          "PRIVATE-TOKEN": this.privateToken,
          "Content-Type": "application/json",
        },
        data,
      });

      return response.data;
    } catch (error: any) {
      throw new MochiError("GitLab API request failed", 500, error);
    }
  }
}
