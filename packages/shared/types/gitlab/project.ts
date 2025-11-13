export interface GitlabProject {
  id: number;
  name: string;
  description: string;
  name_with_namespace: string;
  created_at: string;
  avatar_url: string | null;
  last_activity_at: string;
}
