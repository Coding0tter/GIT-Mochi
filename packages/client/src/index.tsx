import { render } from "solid-js/web";

import "./styles/base.css";
import "./styles/notification.css";
import "./styles/scrollbar.css";
import "./styles/variables.css";

import ProtectedRoute from "@client/auth/ProtectedRoute.tsx";
import Callback from "@client/components/Login/Callback.tsx";
import Login from "@client/components/Login/Login.tsx";
import Test from "@client/components/shared/Test/Test.tsx";
import { Route, Router } from "@solidjs/router";
import axios from "axios";
import App from "./App";
import { BACKEND_URL, SOCKET_URL } from "./constants";
import Home from "./Home";
import KanbanBoard from "./modules/KanbanBoard/KanbanBoard";
import Settings from "./modules/Settings/Settings";
import TimeTrack from "./modules/TimeTrack/TimeTrack";
import { settingsService } from "./services/settingsService";
import ShortcutRegistry from "./shortcutMaps/shortcutRegistry";
import WebSocketHandler from "./sockets/WebSocketHandler";
import { initApi } from "@client/api/mochi/mochiClient.ts";
import { Todos } from "@client/features/todos/index.ts";
import { Kanban } from "@client/features/kanban/index.ts";
import { SetupWizard } from "@client/features/settings/index.ts";
import UserSettings from "@client/features/settings/pages/user-settings/user-settings.tsx";

const root = document.getElementById("root");

axios.defaults.baseURL = `${BACKEND_URL}/api`;
WebSocketHandler.getInstance().init(SOCKET_URL);

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?",
  );
}

await initApi();

await ShortcutRegistry.getInstance().initializeAsync();

const setupStatus = await settingsService.getSetupStatus();
if (!setupStatus.isComplete && window.location.pathname !== "/setup") {
  window.location.href = "/setup";
}

render(
  () => (
    <Router root={App}>
      <Route path="/" component={Home} />
      <Route path="/kanban" component={KanbanBoard} />
      <Route path="/timetrack" component={TimeTrack} />
      <Route path="/settings" component={Settings} />
      <Route path="/login" component={Login} />
      <Route path="/auth/callback" component={Callback} />

      <Route path="/app" component={ProtectedRoute}>
        <Route path="/todo" component={Todos} />
        <Route path="/kanban" component={Kanban} />
        <Route path="/setup" component={SetupWizard} />
        <Route path="/settings" component={UserSettings} />
      </Route>

      <Route path="/safe" component={ProtectedRoute}>
        <Route path="/" component={Test} />
      </Route>
    </Router>
  ),
  root!,
);
