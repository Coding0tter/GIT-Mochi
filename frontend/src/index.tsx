import { render } from "solid-js/web";

import "./styles/variables.css";
import "./styles/base.css";
import "./styles/scrollbar.css";
import "./styles/notification.css";

import App from "./App";
import axios from "axios";
import WebSocketHandler from "./sockets/WebSocketHandler";
import { Route, Router } from "@solidjs/router";
import KanbanBoard from "./modules/KanbanBoard/KanbanBoard";
import TimeTrack from "./modules/TimeTrack/TimeTrack";

const root = document.getElementById("root");

axios.defaults.baseURL = "http://localhost:5000/api";
WebSocketHandler.getInstance().init("ws://localhost:5000");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?"
  );
}

render(
  () => (
    <Router root={App}>
      <Route path="/" component={KanbanBoard} />
      <Route path="/kanban" component={KanbanBoard} />
      <Route path="/timetrack" component={TimeTrack} />
    </Router>
  ),
  root!
);
