export interface Task {
  _id: string;
  gitlabId?: string;
  gitlabIid?: string;
  title: string;
  description: string;
  web_url: string;
  status: string;
  type?: string;
  comments: Array<{
    body: string;
    resolved: boolean;
    author: {
      name: string;
      username: string;
    };
    system: boolean;
  }>;
  custom?: boolean;
  branch: string;
  deleted: boolean;
  labels: string[];
  milestoneName?: string;
}

export const fetchTasksAsync = async (
  showDeleted: boolean = false
): Promise<Task[]> => {
  const res = await fetch(
    `http://localhost:5000/tasks?showDeleted=${showDeleted}`
  );
  return await res.json();
};

export const restoreTaskAsync = async (taskId: string) => {
  await fetch(`http://localhost:5000/tasks/${taskId}/restore`, {
    method: "PUT",
  });
};

export const createTaskAsync = async (task: Partial<Task>) => {
  const res = await fetch("http://localhost:5000/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: task.title,
      status: task.status,
      description: task.description,
      custom: true,
    }),
  });
  return await res.json();
};

export const updateTaskAsync = async (taskId: string, task: Partial<Task>) => {
  try {
    const res = await fetch(`http://localhost:5000/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });
    return res;
  } catch (error) {
    console.error("Failed to update task:", error);
  }
};

export const deleteTaskAsync = async (taskId: string) => {
  await fetch(`http://localhost:5000/tasks/${taskId}`, { method: "DELETE" });
};

export const syncGitLabAsync = async () => {
  const res = await fetch("http://localhost:5000/git/sync", {
    method: "POST",
  });
  return res.ok;
};

export const createMergeRequestAsync = async (issueId: string) => {
  const res = await fetch("http://localhost:5000/git/create-merge-request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ issueId }),
  });

  if (!res.ok) {
    throw new Error("Failed to create merge request");
  }

  return await res.json();
};
