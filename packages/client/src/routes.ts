import { lazy } from "solid-js";

export const routes = [
  {
    path: "/",
    component: lazy(() => import("./modules/KanbanBoard/KanbanBoard")),
  },
  {
    path: "/kanban",
    component: lazy(() => import("./modules/KanbanBoard/KanbanBoard")),
  },
  {
    path: "/timetrack",
    component: lazy(() => import("./modules/TimeTrack/TimeTrack")),
  },
];
