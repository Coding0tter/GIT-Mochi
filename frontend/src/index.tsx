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
import Home from "./Home";
import ShortcutRegistry from "./shortcutMaps/shortcutRegistry";
import { BACKEND_URL, SOCKET_URL } from "./constants";

const root = document.getElementById("root");

axios.defaults.baseURL = `${BACKEND_URL}/api`;
WebSocketHandler.getInstance().init(SOCKET_URL);

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?"
  );
}

await ShortcutRegistry.getInstance().initializeAsync();

render(
  () => (
    <Router root={App}>
      <Route path="/" component={Home} />
      <Route path="/kanban" component={KanbanBoard} />
      <Route path="/timetrack" component={TimeTrack} />
    </Router>
  ),
  root!
);
