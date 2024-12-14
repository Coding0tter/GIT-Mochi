import axios from "axios";
import { MochiError } from "../errors/mochiError";

export class GitlabApiClient {
  private readonly baseUrl: string;
  private readonly privateToken: string;

  constructor() {
    if (!process.env.GIT_URL) {
      throw new MochiError(
        "GitLab API URL not found in environment variables",
        500
      );
    }

    if (!process.env.PRIVATE_TOKEN) {
      throw new MochiError(
        "GitLab Private Token not found in environment variables",
        500
      );
    }

    this.baseUrl = process.env.GIT_URL + "/api/v4";
    this.privateToken = process.env.PRIVATE_TOKEN;
  }

  async request(
    endpoint: string,
    method: "GET" | "POST" | "PUT" = "GET",
    data?: any
  ) {
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
      throw new MochiError(
        `GitLab API request failed for ${endpoint} with method ${method} and ${
          data ? data : "no data"
        }`,
        500,
        error
      );
    }
  }

  async paginatedRequest(
    endpoint: string,
    method: "GET" | "POST" | "PUT" = "GET",
    data?: any
  ) {
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

      const pagination = {
        totalPages: Number(response.headers["x-total-pages"]),
        prevPage: Number(response.headers["x-prev-page"]),
        nextPage: Number(response.headers["x-next-page"]),
        currentPage: Number(response.headers["x-page"]),
      };

      return { data: response.data, pagination };
    } catch (error: any) {
      throw new MochiError(
        `GitLab API request failed for ${endpoint} with method ${method} and ${
          data ? data : "no data"
        }`,
        500,
        error
      );
    }
  }
}
