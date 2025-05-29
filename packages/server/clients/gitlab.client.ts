import { MochiError } from "@server/errors/mochi.error";
import { SettingRepo } from "@server/repositories/setting.repo";
import { chunkArray } from "@server/utils/chunkArray";
import { fetchAllFromPaginatedApiAsync } from "@server/utils/fetchAllFromPaginatedApi";
import { transformDiscussion } from "@server/utils/transformHelpers";
import axios, { AxiosError } from "axios";
import { SettingKeys } from "shared";
import type { RequestParams } from "shared/types";

export class GitlabClient {
  private readonly settingsRepo: SettingRepo;

  constructor() {
    this.settingsRepo = new SettingRepo();
  }

  public async testRequest(url: string, token: string) {
    const response = await axios({
      url: `${url}/api/v4/user`,
      method: "GET",
      headers: {
        "PRIVATE-TOKEN": token,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  }

  public async getMyEntities(
    type: "merge_request" | "issue",
    userId: number,
    projectId: string,
    lastSyncDate: Date | null,
  ) {
    return await fetchAllFromPaginatedApiAsync((pagination) =>
      this.paginatedRequest({
        endpoint: `/projects/${projectId}/${type}s/?assignee_id=${userId}&page=${pagination.currentPage}&per_page=${pagination.limit}${lastSyncDate ? "&updated_after=" + lastSyncDate.toISOString() : ""}`,
        method: "GET",
      }),
    );
  }

  public async getOtherEntities(
    type: "merge_request" | "issue",
    projectId: string,
    existingEntities: number[],
    lastSyncDate: Date | null,
  ) {
    const remoteEntities: any[] = [];
    const deadTasks: any[] = [];
    const CHUNK_SIZE = 90;
    const iidChunks = chunkArray(existingEntities, CHUNK_SIZE);

    await Promise.all(
      iidChunks.map(async (chunk) => {
        try {
          const query = chunk.map((iid) => `iids[]=${iid}`).join("&");
          const fetched = await this.request({
            endpoint: `/projects/${projectId}/${type}s?${query}&per_page=${CHUNK_SIZE + 1}${lastSyncDate ? "&updated_after=" + lastSyncDate.toISOString() : ""}`,
            method: "GET",
          });
          remoteEntities.push(...fetched);
        } catch (err) {
          await Promise.all(
            chunk.map(async (iid) => {
              try {
                const fetched = await this.request({
                  endpoint: `/projects/${projectId}/${type}s?iids[]=${iid}`,
                  method: "GET",
                });
                remoteEntities.push(...fetched);
              } catch (e: any) {
                if (e instanceof MochiError && e.statusCode === 404) {
                  const deadTask = existingEntities.find(
                    (entity) => entity === iid,
                  );
                  if (deadTask) {
                    deadTasks.push(deadTask);
                  }
                } else {
                  throw e;
                }
              }
            }),
          );
        }
      }),
    );

    return [remoteEntities, deadTasks];
  }

  public async updateAssignee(
    projectId: string,
    gitlabIid: string,
    assignee_id: string,
  ) {
    await this.request({
      endpoint: `/projects/${projectId}/merge_requests/${gitlabIid}`,
      method: "PUT",
      data: { assignee_id },
    });
  }

  public async getDiscussions(
    projectId: string,
    gitlabIid: number | string,
    type: string,
  ) {
    const discussions = await fetchAllFromPaginatedApiAsync((pagination) =>
      this.paginatedRequest({
        endpoint: `/projects/${projectId}/${type}s/${gitlabIid}/discussions?page=${pagination.currentPage}&per_page=${pagination.limit}`,
        method: "GET",
      }),
    );

    return discussions.map(transformDiscussion);
  }

  public async getUserByAccessToken() {
    return await this.request({
      endpoint: "/user",
      method: "GET",
    });
  }

  public async getPipelineState(projectId: string, gitlabIid: number) {
    const result = {
      pipelineStatus: "",
      latestPipelineId: 0,
      pipelineReports: [] as any[],
    };

    const pipelines = await this.request({
      endpoint: `/projects/${projectId}/merge_requests/${gitlabIid}/pipelines`,
      method: "GET",
    });

    const pipeline = pipelines.length ? pipelines[0] : null;

    if (pipeline) {
      result.pipelineStatus = pipeline.status;
      result.latestPipelineId = pipeline.id;
      if (pipeline.status === "failed") {
        try {
          const report = await this.request({
            endpoint: `/projects/${projectId}/pipelines/${pipeline.id}/test_report?per_page=100`,
            method: "GET",
          });

          const failedTests = report.test_suites.flatMap((suite: any) =>
            suite.test_cases.filter((test: any) => test.status === "failed"),
          );

          result.pipelineReports = failedTests.map((test: any) => ({
            name: test.name ?? "Unknown",
            classname: test.classname ?? "Unknown",
            attachment_url: test.attachment_url ?? "",
          }));
        } catch (e: any) {
          throw new MochiError("Failed to fetch pipeline test report", 500, e);
        }
      }
    }
    return result;
  }

  public async request({ endpoint, method = "GET", data }: RequestParams) {
    try {
      const git_url = (
        await this.settingsRepo.getByKeyAsync(SettingKeys.GITLAB_URL)
      )?.value;
      const privateToken = (
        await this.settingsRepo.getByKeyAsync(SettingKeys.PRIVATE_TOKEN)
      )?.value;

      if (!git_url || !privateToken) {
        throw new MochiError("GitLab URL or Private Token is not set", 400);
      }

      const response = await axios({
        url: `${git_url}/api/v4${endpoint}`,
        method,
        headers: {
          "PRIVATE-TOKEN": privateToken,
          "Content-Type": "application/json",
        },
        data,
      });
      return response.data;
    } catch (error: any) {
      throw new MochiError(
        `GitLab API request failed for ${endpoint} with method ${method} and ${
          data ? JSON.stringify(data) : "no data"
        }. ${error.message}`,
        error instanceof AxiosError ? error?.response?.status : 500,
        error,
      );
    }
  }

  public async paginatedRequest({
    endpoint,
    method = "GET",
    data,
  }: RequestParams) {
    try {
      const git_url = (
        await this.settingsRepo.getByKeyAsync(SettingKeys.GITLAB_URL)
      )?.value;
      const privateToken = (
        await this.settingsRepo.getByKeyAsync(SettingKeys.PRIVATE_TOKEN)
      )?.value;

      if (!git_url || !privateToken) {
        throw new MochiError("GitLab URL or Private Token is not set", 400);
      }

      const response = await axios({
        url: `${git_url}/api/v4${endpoint}`,
        method,
        headers: {
          "PRIVATE-TOKEN": privateToken,
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
          data ? JSON.stringify(data) : "no data"
        }. ${error.message}`,
        500,
        error,
      );
    }
  }
}
