export const getActionInfo = (actionName: string) => {
  switch (actionName) {
    case "assigned":
      return {
        label: "Assigned",
        text: "assigned you",
        icon: "👤",
        color: "var(--color-blue)",
      };
    case "mentioned":
      return {
        label: "Mentioned",
        text: "mentioned you",
        icon: "@",
        color: "var(--color-yellow)",
      };
    case "marked":
      return {
        label: "Marked",
        text: "marked",
        icon: "📝",
        color: "var(--color-mauve)",
      };
    case "approval_required":
      return {
        label: "Approval Required",
        text: "requested approval",
        icon: "✅",
        color: "var(--color-green)",
      };
    case "review_requested":
      return {
        label: "Review Requested",
        text: "requested review",
        icon: "👀",
        color: "var(--color-peach)",
      };
    case "build_failed":
      return {
        label: "Build Failed",
        text: "build failed",
        icon: "❌",
        color: "var(--color-red)",
      };
    default:
      return {
        label: actionName.replace(/_/g, " "),
        text: actionName.replace(/_/g, " "),
        icon: "📋",
        color: "var(--color-text)",
      };
  }
};

export const getTypeInfo = (targetType: string) => {
  switch (targetType) {
    case "Issue":
      return { icon: "🐛", label: "Issue", color: "var(--color-green)" };
    case "MergeRequest":
      return { icon: "🔀", label: "MR", color: "var(--color-blue)" };
    case "Epic":
      return { icon: "📋", label: "Epic", color: "var(--color-mauve)" };
    default:
      return { icon: "📄", label: targetType, color: "var(--color-text)" };
  }
};
