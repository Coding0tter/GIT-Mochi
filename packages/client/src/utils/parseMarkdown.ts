import { marked } from "marked";
import { GIT_URL } from "../constants";
import { uiStore } from "../stores/uiStore";
import DOMPurify from "dompurify";

export const parseMarkdown = (input: string) => {
  const sanitized = DOMPurify.sanitize(input);
  const markdown = marked(sanitized, { async: false });
  const user = uiStore.user?.name;

  return markdown
    .replaceAll(
      'src="/',
      `src="${GIT_URL}/-/project/${uiStore.currentProject?.id}/`,
    )
    .replaceAll(
      /<img\s+src="([^"]+\.webm)"\s+alt="([^"]*)"\s*\/?>/g,
      '<video width="700" controls><source src="$1" type="video/webm"></video>',
    )
    .replaceAll(
      /<img\s+src="([^"]+\.MOV)"\s+alt="([^"]*)"\s*\/?>/g,
      '<video width="700" controls><source src="$1" type="video/mp4"></video>',
    )
    .replaceAll(/@(\w+)/g, (match, mentionedUser) =>
      mentionedUser === user ? `<div class="mention">${match}</div>` : match,
    );
};
