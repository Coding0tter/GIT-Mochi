import { debounce } from "lodash";

export const scrollIntoView = debounce((element: HTMLElement | null) => {
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }
}, 100);
