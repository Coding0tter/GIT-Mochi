/* @refresh reload */
import { render } from "solid-js/web";

import "./index.css";
import "./styles/base.css";
import "./styles/scrollbar.css";
import "./styles/header.css";
import "./styles/kanban.css";
import "./styles/notification.css";
import "./styles/modal.css";
import "./styles/task-flags.css";

import App from "./App";
import axios from "axios";
import WebSocketHandler from "./sockets/WebSocketHandler";

const root = document.getElementById("root");

axios.defaults.baseURL = "http://localhost:5000/api";
WebSocketHandler.getInstance().init("ws://localhost:5000");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?"
  );
}

render(() => <App />, root!);
