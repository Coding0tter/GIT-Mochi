export const parseMarkdownForImages = (text: string) => {
  const imageRegex = /!\[.*?\]\((.*?)\)/g;
  const matches = [...text.matchAll(imageRegex)];
  const images = matches.map(
    (match) => "https://git.latido.at/-/project/92" + match[1]
  );

  const cleanedText = text.replace(imageRegex, "").trim();

  return { cleanedText, images };
};

export interface Comment {
  id: number;
  body: string;
  resolved: boolean;
  author: {
    name: string;
    username: string;
  };
  system: boolean;
}

export const getMergeRequestComments = async (mergeRequestId: string) => {
  const commentsResponse = await fetch(
    `https://git.latido.at/api/v4/projects/92/merge_requests/${mergeRequestId}/notes`,
    {
      headers: {
        "PRIVATE-TOKEN": "glpat-ECehZBHCvVaAqUd-idty",
      },
    }
  );

  const comments = await commentsResponse.json();

  return comments.filter(
    (comment: Comment) =>
      !comment.system && comment.author.username !== "merge_train"
  );
};

export const getUser = async () => {
  try {
    const userResponse = await fetch("http://localhost:5000/git/user");
    return userResponse.json();
  } catch (error) {
    console.error("Error getting user:", error);
    return;
  }
};

export const loadProjectsAsync = async () => {
  try {
    const projectsResponse = await fetch("http://localhost:5000/git/projects");
    return projectsResponse.json();
  } catch (error) {
    console.error("Error getting projects:", error);
    return;
  }
};

export const setProject = async (projectId: string) => {
  try {
    const response = await fetch(
      `http://localhost:5000/git/project/${projectId}`,
      {
        method: "PATCH",
      }
    );
    return response.json();
  } catch (error) {
    console.error("Error setting project:", error);
    return;
  }
};

export const getProject = async () => {
  try {
    const response = await fetch("http://localhost:5000/git/project");
    return response.json();
  } catch (error) {
    console.error("Error getting project:", error);
  }
};
