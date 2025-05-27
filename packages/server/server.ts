import { MochiError } from "@server/errors/mochi.error";
import cors from "cors";
import express from "express";
import http from "http";
import { connect } from "mongoose";
import { SettingKeys } from "shared";
import { closeMergedMRJob } from "./background-jobs/closeMergedMergeRequests";
import { contextMiddleware } from "./middlewares/context.middleware";
import { globalErrorHandler } from "./middlewares/globalErrorHandler.middleware";
import { SettingRepo } from "./repositories/setting.repo";
import gitlabRoutes from "./routes/gitlab.routes";
import projectRoutes from "./routes/project.router";
import ruleRoutes from "./routes/rule.router";
import settingRoutes from "./routes/setting.router";
import taskRoutes from "./routes/task.router";
import timeTrackRoutes from "./routes/timeTrack.router";
import "./services/actions";
import "./services/emitters";
import { ProjectService } from "./services/project.service";
import { SocketHandler } from "./sockets";
import { logError, logInfo } from "./utils/logger";
import { GitlabSync } from "./syncs/gitlab.sync";

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
