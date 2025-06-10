import { sortBy } from "lodash";

const priorityOrder = [
  "priority/INTERMEDIATE",
  "priority/STAGING",
  "priority/HIGH",
  "priority/MEDIUM",
  "priority/LOW",
];

export const orderPriorityLabels = (labels: string[]) =>
  sortBy(labels ?? [], (label) => {
    const idx = priorityOrder.indexOf(label);
    return idx === -1 ? priorityOrder.length : idx;
  }).filter((item: string) => item.toLowerCase().includes("priority"));
