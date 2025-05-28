import { marked } from "marked";
import { uiStore } from "../stores/uiStore";
import DOMPurify from "dompurify";
import { settingsStore } from "@client/stores/settings.store";

export const parseMarkdown = (input: string) => {
  const sanitized = DOMPurify.sanitize(input);
  const markdown = marked(sanitized, { async: false });
  const user = uiStore.user?.name;

  return markdown
    .replaceAll(
      'src="/',
      `src="${settingsStore.gitlab_url}/-/project/${uiStore.currentProject?.id}/`,
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
