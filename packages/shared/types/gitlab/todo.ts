export interface GitlabTodo {
  id: number;
  body: string;
  state: "pending" | "done";
  created_at: string;
  updated_at: string;
  target_type: "Issue" | "MergeRequest" | "Epic" | string;
  target: {
    id: number;
    iid: number;
    title: string;
    web_url: string;
    state?: "opened" | "closed" | "merged" | string;
    description?: string;
    labels?: string[];
    milestone?: {
      id: number;
      title: string;
    };
  };
  target_url: string;
  author: {
    id: number;
    name: string;
    username: string;
    avatar_url: string;
    web_url: string;
  };
  project: {
    id: number;
    name: string;
    name_with_namespace: string;
    web_url: string;
    path_with_namespace: string;
  };
  action_name:
    | "assigned"
    | "mentioned"
    | "marked"
    | "approval_required"
    | "review_requested"
    | string;
}
