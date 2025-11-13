export interface GitlabUser {
  id: number;
  avatar_url: string;
  email: string;
  name: string;
  username: string;
}

export function mapToGitlabUser(data: any): GitlabUser {
  return {
    id: data?.id,
    avatar_url: data.avatar_url,
    email: data.email,
    name: data.name,
    username: data.username,
  };
}
