import { MochiError } from "@server/errors/mochi.error";
import { requireAuth } from "@server/middlewares/auth.middleware.ts";
import { ApprovalsSync } from "@server/syncs/approvals.sync.ts";
import { GitlabSyncV2 } from "@server/syncs/gitlab.sync.v2.ts";
import { asyncLocalStorage } from "@server/utils/asyncContext.ts";
import cors from "cors";
import express from "express";
import http from "http";
import { connect } from "mongoose";
import { SettingKeys } from "shared";
import { contextMiddleware } from "./middlewares/context.middleware";
import { globalErrorHandler } from "./middlewares/globalErrorHandler.middleware";
import { SettingRepo } from "./repositories/setting.repo";
import authRoutes from "./routes/auth.route";
import discussionRouter from "./routes/discussion.router";
import gitlabRoutes from "./routes/gitlab.routes";
import gitlabV2Routes from "./routes/gitlab.router.v2";
import labelRoutes from "./routes/label.router";
import projectRoutes from "./routes/project.router";
import projectV2Routes from "./routes/project.router.v2";
import ruleRoutes from "./routes/rule.router";
import safeRoutes from "./routes/safe.router";
import settingRoutes from "./routes/setting.router";
import settingV2Routes from "./routes/setting.router.v2";
import taskRoutes from "./routes/task.router";
import taskV2Routes from "./routes/task.router.v2";
import timeTrackRoutes from "./routes/timeTrack.router";
import todoRoutes from "./routes/todo.router";
import userRoutes from "./routes/user.router";
import "./services/actions";
import "./services/emitters";
import { ProjectService } from "./services/project.service";
import { SocketHandler } from "./sockets";
import { logError, logInfo } from "./utils/logger";
import { GitlabSync } from "@server/syncs/gitlab.sync.ts";
import { SettingService } from "@server/services/setting.service.v2.ts";
import { User } from "@server/models/user.model.ts";
import { checkGitlabToken } from "@server/utils/gitlabAuth.ts";

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

app.use((_req, _res, next) => asyncLocalStorage.run(new Map(), next));
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3005", // your client URL
    credentials: true,
  }),
);
app.use(express.json());
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
app.use("/api/auth", authRoutes);

app.use("/api/todo", requireAuth, todoRoutes);
app.use("/api/label", requireAuth, labelRoutes);
app.use("/api/project", requireAuth, projectV2Routes);
app.use("/api/user", requireAuth, userRoutes);
app.use("/api/setting", requireAuth, settingV2Routes);
app.use("/api/task", requireAuth, taskV2Routes);
app.use("/api/discussion", requireAuth, discussionRouter);
app.use("/api/gitlab", requireAuth, gitlabV2Routes);

app.use("/api/safe", requireAuth, safeRoutes);

app.use(globalErrorHandler);

let backgroundJobInterval: NodeJS.Timer;

const startBackgroundJobs = () => {
  backgroundJobInterval = setInterval(async () => {
    await jobs();
  }, 60 * 1000);
  logInfo("Background jobs started");
};

const stopBackgroundJobs = () => {
  if (backgroundJobInterval) {
    clearInterval(backgroundJobInterval);
    logInfo("Background jobs stopped");
  }
};

const PORT = 5000;
server.listen(PORT, () => {
  logInfo(`Gitlab-Mochi backend running on port ${PORT}`);
  startBackgroundJobs();
});

// Graceful shutdown handling
const gracefulShutdown = (signal: string) => {
  logInfo(`Received ${signal}, shutting down gracefully...`);

  stopBackgroundJobs();

  server.close(() => {
    logInfo("HTTP server closed.");
    process.exit(0);
  });

  // Force exit after 10 seconds
  setTimeout(() => {
    logError(new MochiError("Forced shutdown after timeout"));
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

const syncs = [new GitlabSync(), new GitlabSyncV2(), new ApprovalsSync()];

// Reuse service instances to prevent memory leaks
const settingRepo = new SettingRepo();
const settingService = new SettingService();
const projectService = new ProjectService();

let isSyncing = false;

const jobs = async () => {
  const setupComplete = await settingRepo.getByKeyAsync(
    SettingKeys.SETUP_COMPLETE,
  );

  if (setupComplete?.value !== "true") {
    logInfo("Setup not complete. Skipping sync jobs.");
    return;
  }

  if ((await projectService.getCurrentProjectAsync()) === null) {
    logInfo("No project selected. Skipping sync jobs.");
    return;
  }

  const user = await User.findOne({ isAdmin: true });
  if (!user) {
    logInfo("No admin user found. Skipping sync jobs.");
    return;
  }

  await checkGitlabToken(user);

  try {
    console.log("============Background jobs============");
    console.time("Background Jobs");

    if (!isSyncing) {
      isSyncing = true;
      for (const sync of syncs) {
        await sync.sync();
      }

      await settingService.setSettingByKey(
        SettingKeys.LAST_SYNC,
        new Date().toISOString(),
      );

      isSyncing = false;
    }

    console.timeEnd("Background Jobs");
  } catch (error) {
    logError(new MochiError("Failed jobs", 500, error as Error));
  }
};
