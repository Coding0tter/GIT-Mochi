import { MochiError } from "@server/errors/mochi.error.ts";
import { SettingsService } from "@server/services/settings.service.ts";
import { ContextKeys, getContext } from "@server/utils/asyncContext.ts";
import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
} from "axios";

export class GitlabClient {
  private api!: AxiosInstance;
  private baseURL!: string;

  private _settingsService: SettingsService;

  constructor() {
    this._settingsService = new SettingsService();
  }

  async init() {
    const config = await this._settingsService.getGitlabConfig();

    if (!config || !config.url)
      throw new MochiError("Gitlab URL is not configured");

    this.baseURL = `${config.url}/api/v4`;
    this.api = axios.create({
      baseURL: this.baseURL,
    });

    this.api.interceptors.request.use((config) => {
      const token = getContext(ContextKeys.GitlabToken);
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }

      config.headers["Content-Type"] = "application/json";
      return config;
    });
  }

  async request<T = unknown>(config: AxiosRequestConfig) {
    await this._ensureReady();

    try {
      return await this.api.request<T>(config);
    } catch (err) {
      const endpoint = config.url || "";
      const method = config.method?.toUpperCase() || "REQUEST";
      throw this.wrapAxiosError(method, endpoint, err);
    }
  }

  async get<T = unknown>(endpoint: string, config?: AxiosRequestConfig) {
    await this._ensureReady();

    try {
      const { data } = await this.api.get<T>(endpoint, config);
      return data;
    } catch (error) {
      throw this.wrapAxiosError("GET", endpoint, error);
    }
  }

  async post<T = unknown, B = unknown>(
    endpoint: string,
    body?: B,
    config?: AxiosRequestConfig,
  ) {
    await this._ensureReady();

    try {
      const { data } = await this.api.post<T>(endpoint, body, config);
      return data;
    } catch (err) {
      throw this.wrapAxiosError("POST", endpoint, err);
    }
  }

  async put<T = unknown, B = unknown>(
    endpoint: string,
    body?: B,
    config?: AxiosRequestConfig,
  ) {
    await this._ensureReady();

    try {
      const { data } = await this.api.put<T>(endpoint, body, config);
      return data;
    } catch (err) {
      throw this.wrapAxiosError("PUT", endpoint, err);
    }
  }

  async delete<T = unknown>(endpoint: string, config?: AxiosRequestConfig) {
    await this._ensureReady();

    try {
      const { data } = await this.api.delete<T>(endpoint, config);
      return data;
    } catch (err) {
      throw this.wrapAxiosError("DELETE", endpoint, err);
    }
  }

  private async _ensureReady() {
    if (!this.api) await this.init();
  }

  private wrapAxiosError(method: string, endpoint: string, err: unknown) {
    const ae = err as AxiosError<any>;
    const status = ae.response?.status;
    const msg = ae.response?.data?.message || ae.message;

    return new MochiError(
      `${method} ${endpoint} failed with status ${status ?? ""}: ${msg ?? ""}`,
    );
  }
}
