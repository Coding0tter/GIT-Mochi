import cors from "cors";
import express from "express";
import http from "http";
import { connect } from "mongoose";
import { closeMergedMRJob } from "./background-jobs/closeMergedMergeRequests";
import { syncCommentJob } from "./background-jobs/commentSync";
import { syncGitlabJob } from "./background-jobs/gitlabSync";
import { contextMiddleware } from "./middlewares/contextMiddleware";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import gitlabRoutes from "./routes/gitlabRoutes";
import projectRoutes from "./routes/projectRouter";
import ruleRoutes from "./routes/ruleRoutes";
import taskRoutes from "./routes/taskRoutes";
import timeTrackRoutes from "./routes/timeTrackRoutes";
import "./services/actions";
import "./services/emitters";
import { GitlabService } from "./services/gitlabService";
import { SocketHandler } from "./sockets";
import { logError, logInfo } from "./utils/logger";
import { syncPipelineStatusJob } from "./background-jobs/pipelineStatusSync";

logInfo(`
  
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

let retries = 5;

do {
  try {
    const gitlabService = new GitlabService();
    await gitlabService.getUserByAccessTokenAsync();
    logInfo("User retrieved successfully");
    break;
  } catch (error) {
    retries--;
    console.error(
      `Failed to retrieve user from Gitlab. Retries left: ${retries}`
    );

    if (retries === 0) {
      console.error(
        "Failed to retrieve user from Gitlab after 5 retries. Maybe the Gitlab server is down?"
      );
      retries = 5;
    }

    await new Promise((resolve) => setTimeout(resolve, 60000));
  }
} while (retries > 0);

app.use("/api/tasks", taskRoutes);
app.use("/api/git", gitlabRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/rules", ruleRoutes);
app.use("/api/timetrack", timeTrackRoutes);

// Sync comments every minute
setInterval(() => {
  syncCommentJob();
  syncGitlabJob();
  syncPipelineStatusJob();
}, 60000);

// Close merged merge requests every minute
closeMergedMRJob();

const PORT = 5000;
server.listen(PORT, () =>
  logInfo(`Gitlab-Mochi backend running on port ${PORT}`)
);