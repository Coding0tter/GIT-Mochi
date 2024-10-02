import axios, { AxiosError } from "axios";
import { Task } from "../models/task";
import { User, type IUser } from "../models/user";
import { Setting } from "../models/setting";
import { logError, logInfo } from "../utils/logger";

const GIT_API_URL = process.env.GIT_URL + "/api/v4";

export const syncGitLabData = async (): Promise<void> => {
  await syncMergeRequests();
  await syncIssues();
};

export const createGitLabMergeRequest = async (
  issueId: string
): Promise<any> => {
  const currentProjectId = await Setting.findOne({ key: "currentProject" });

  if (!currentProjectId) throw new Error("No project selected");

  const issue = await Task.findOne({ gitlabIid: issueId });
  if (!issue) throw new Error("Issue not found");

  const createBranchResponse = await fetch(
    `${GIT_API_URL}/projects/${currentProjectId.value}/repository/branches`,
    {
      method: "POST",
      headers: {
        "PRIVATE-TOKEN": process.env.PRIVATE_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: currentProjectId.value,
        branch: issue.gitlabIid,
        ref: "develop",
      }),
    }
  );

  const createBranchData = await createBranchResponse.json();
  if (createBranchData.message === "Branch already exists")
    throw new Error("Branch already exists");

  const user = await getUserByPersonalAccessTokenAsync();

  if (!user) throw new Error("No current user found");

  const createMergeRequestResponse = await fetch(
    `${GIT_API_URL}/projects/${currentProjectId.value}/merge_requests`,
    {
      method: "POST",
      headers: {
        "PRIVATE-TOKEN": process.env.PRIVATE_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: currentProjectId.value,
        source_branch: issue.gitlabIid,
        target_branch: "develop",
        title: `Draft: Resolve "${issue.title}"`,
        description: `Closes #${issue.gitlabIid}`,
        assignee_id: user.gitlabId,
        labels: issue.labels?.join(","),
        milestone_id: issue.milestoneId,
      }),
    }
  );

  await Task.findByIdAndUpdate(issue._id, { status: "closed" });

  return {
    branch: createBranchData,
    mergeRequest: await createMergeRequestResponse.json(),
  };
};

export const getUserByPersonalAccessTokenAsync = async (): Promise<IUser> => {
  const response = await axios.get(`${GIT_API_URL}/user`, {
    headers: { "PRIVATE-TOKEN": process.env.PRIVATE_TOKEN },
  });

  if (response.status !== 200) throw new Error("Error fetching user data");

  const userData = response.data;
  let user = await User.findOne({ gitlabId: userData.id });

  if (!user) {
    user = await User.create({
      gitlabId: userData.id,
      username: userData.username,
      email: userData.email,
      name: userData.name,
      avatar_url: userData.avatar_url,
    });
  }

  return user;
};

export const getGitlabProjectsAsync = async () => {
  const projectsResponse = await axios.get(`${GIT_API_URL}/projects`, {
    headers: { "PRIVATE-TOKEN": process.env.PRIVATE_TOKEN },
  });

  return projectsResponse.data;
};

export const getGitlabProjectAsync = async (projectId: string) => {
  const projectResponse = await axios.get(
    `${GIT_API_URL}/projects/${projectId}`,
    {
      headers: { "PRIVATE-TOKEN": process.env.PRIVATE_TOKEN },
    }
  );

  return projectResponse.data;
};

const syncMergeRequests = async () => {
  const mergeRequestResponse = await axios.get(
    `${GIT_API_URL}/merge_requests?scope=assigned_to_me`,
    {
      headers: { "PRIVATE-TOKEN": process.env.PRIVATE_TOKEN },
    }
  );

  const gitlabMergeRequests = mergeRequestResponse.data;

  for (const mr of gitlabMergeRequests) {
    const existingTask = await Task.findOne({ gitlabId: mr.id });
    const comments = await getMergeRequestComments(mr.iid, mr.project_id);

    const taskData = { labels: mr.labels, branch: mr.source_branch, comments };

    if (existingTask) {
      await Task.findByIdAndUpdate(existingTask._id, taskData);
    } else {
      await Task.create({
        ...taskData,
        projectId: mr.project_id,
        gitlabId: mr.id,
        web_url: mr.web_url,
        type: "merge_request",
        gitlabIid: mr.iid,
        title: mr.title,
        description: mr.description,
        status: mr.state,
        custom: false,
      });
    }
  }
};

const syncIssues = async () => {
  const issuesResponse = await fetch(
    `${GIT_API_URL}/issues?scope=assigned_to_me`,
    {
      headers: { "PRIVATE-TOKEN": process.env.PRIVATE_TOKEN },
    }
  );
  const issues = await issuesResponse.json();

  for (const issue of issues) {
    const existingTask = await Task.findOne({ gitlabId: issue.id });
    const taskData = {
      labels: issue.labels,
      milestoneId: issue.milestone?.id,
      milestoneName: issue.milestone?.title,
    };
    if (existingTask) {
      await Task.findByIdAndUpdate(existingTask._id, taskData);
    } else {
      await Task.create({
        gitlabId: issue.id,
        gitlabIid: issue.iid,
        projectId: issue.project_id,
        web_url: issue.web_url,
        ...taskData,
        type: "issue",
        status: "opened",
        custom: false,
        title: issue.title,
        description: issue.description,
      });
    }
  }
};

export const getMergeRequestComments = async (
  mergeRequestIid: string,
  projectId: string
) => {
  try {
    const commentsResponse = await axios.get(
      `${GIT_API_URL}/projects/${projectId}/merge_requests/${mergeRequestIid}/notes`,
      {
        headers: {
          "PRIVATE-TOKEN": process.env.PRIVATE_TOKEN,
        },
      }
    );

    const comments = commentsResponse.data;

    if (Array.isArray(comments)) {
      const filteredAndProcessedComments = comments
        .filter(
          (comment: { system: boolean; author: { username: string } }) =>
            !comment.system && comment.author.username !== "merge_train"
        )
        .map((comment) => {
          const imageRegex = /!\[.*?\]\((.*?)\)/g;
          const matches = [...comment.body.matchAll(imageRegex)];
          const images = matches.map(
            (match) =>
              `${process.env.GIT_URL}/-/project/${projectId}` + match[1]
          );

          const cleanedText = comment.body.replace(imageRegex, "").trim();

          comment.body = cleanedText;
          comment.images = images;

          return comment;
        });

      return filteredAndProcessedComments;
    }
    return [];
  } catch (error) {
    if (error instanceof AxiosError) {
      logError(
        `Failed to fetch comments: ${error?.message} ${error?.config?.url}`
      );
      return [];
    }

    logError(`Failed to fetch comments: ${error}`);
  }
};
