import { MochiError } from "@server/errors/mochiError";
import cors from "cors";
import express from "express";
import http from "http";
import { connect } from "mongoose";
import { SettingKeys } from "shared";
import { closeMergedMRJob } from "./background-jobs/closeMergedMergeRequests";
import { GitlabSync } from "./gitlab/sync";
import { contextMiddleware } from "./middlewares/contextMiddleware";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import { SettingRepo } from "./repositories/settingRepo";
import gitlabRoutes from "./routes/gitlabRoutes";
import projectRoutes from "./routes/projectRouter";
import ruleRoutes from "./routes/ruleRoutes";
import settingRoutes from "./routes/settingRoutes";
import taskRoutes from "./routes/taskRoutes";
import timeTrackRoutes from "./routes/timeTrackRoutes";
import "./services/actions";
import "./services/emitters";
import { ProjectService } from "./services/projectService";
import { SocketHandler } from "./sockets";
import { logError, logInfo } from "./utils/logger";

logInfo(`
  Starting Gitlab-Mochi backend...
  
  ███╗   ███╗ ██████╗  ██████╗██╗  ██╗██╗
  ████╗ ████║██╔═══██╗██╔════╝██║  ██║██║
  ██╔████╔██║██║   ██║██║     ███████║██║
  ██║╚██╔╝██║██║   ██║██║     ██╔══██║██║
  ██║ ╚═╝ ██║╚██████╔╝╚██████╗██║  ██║██║
  ╚═╝     ╚═╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝╚═╝
  `);

const app = express();
const server = http.createServer(app);
SocketHandler.getInstance().init(server);

app.use(cors());
app.use(express.json());
app.use(globalErrorHandler);
app.use(contextMiddleware);

connect("mongodb://mongo:27017/kanban", {})
  .then(() => logInfo("MongoDB connected"))
  .catch((err) => logError(err));

app.use("/api/tasks", taskRoutes);
app.use("/api/git", gitlabRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/rules", ruleRoutes);
app.use("/api/timetrack", timeTrackRoutes);
app.use("/api/settings", settingRoutes);

// Sync comments every minute
setInterval(async () => {
  await jobs();
}, 60 * 1000);

const PORT = 5000;
server.listen(PORT, () =>
  logInfo(`Gitlab-Mochi backend running on port ${PORT}`),
);

const syncs = [new GitlabSync()];

const jobs = async () => {
  const settingRepo = new SettingRepo();
  const setupComplete = await settingRepo.getByKeyAsync(
    SettingKeys.SETUP_COMPLETE,
  );

  if (setupComplete?.value !== "true") {
    logInfo("Setup not complete. Skipping sync jobs.");
    return;
  }

  const projectService = new ProjectService();
  if ((await projectService.getCurrentProjectAsync()) === null) {
    logInfo("No project selected. Skipping sync jobs.");
    return;
  }

  try {
    console.log("============Background jobs============");
    console.time("Background Jobs");
    for (const sync of syncs) {
      await sync.sync();
    }
    closeMergedMRJob();
    console.timeEnd("Background Jobs");
  } catch (error) {
    logError(new MochiError("Failed jobs", 500, error as Error));
  }
};
