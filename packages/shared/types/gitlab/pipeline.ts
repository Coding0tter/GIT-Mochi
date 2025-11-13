export interface GitlabPipeline {
  id: number;
  iid: number;
  status: string;
  web_url: string;
}

export function mapToGitlabPipeline(data: any): GitlabPipeline {
  return {
    id: data?.id,
    iid: data.iid,
    status: data.status,
    web_url: data.web_url,
  };
}
