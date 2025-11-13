import { marked } from "marked";
import { uiStore } from "../stores/uiStore";
import DOMPurify from "dompurify";
import { settingsStore } from "@client/stores/settings.store";

export const parseMarkdown = (input: string) => {
  const sanitized = DOMPurify.sanitize(input);
  const markdown = marked(sanitized, { async: false });

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
    .replaceAll(/@(\w+)/g, (match, mentionedUser) => {
      const color = getMentionColor(mentionedUser);
      return `<span class="mention" style="color:${color}">${match}</span>`;
    });
};

const getMentionColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (Math.imul(31, hash) + name.charCodeAt(i)) | 0;
  }

  const hue = (hash >>> 0) % 360;

  return `hsl(${hue} 70% 65%)`;
};
