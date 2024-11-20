import cors from "cors";
import express from "express";
import http from "http";
import { connect } from "mongoose";
import { closeMergeMergeRequestsJob } from "./backend/background-jobs/closeMergedMergeRequests";
import { syncCommentJob } from "./backend/background-jobs/commentSync";
import { syncGitlabJob } from "./backend/background-jobs/gitlabSync";
import { MochiError } from "./backend/errors/mochiError";
import { contextMiddleware } from "./backend/middlewares/contextMiddleware";
import { globalErrorHandler } from "./backend/middlewares/globalErrorHandler";
import gitlabRoutes from "./backend/routes/gitlabRoutes";
import projectRoutes from "./backend/routes/projectRouter";
import ruleRoutes from "./backend/routes/ruleRoutes";
import taskRoutes from "./backend/routes/taskRoutes";
import timeTrackRoutes from "./backend/routes/timeTrackRoutes";
import "./backend/services/actions";
import "./backend/services/emitters";
import { GitlabService } from "./backend/services/gitlabService";
import { SocketHandler } from "./backend/sockets";
import { logError, logInfo } from "./backend/utils/logger";

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

    if (retries === 0) {
      throw new MochiError(
        "Failed to retrieve user after multiple attempts",
        500,
        error as Error
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
} while (retries > 0);

app.use("/api/tasks", taskRoutes);
app.use("/api/git", gitlabRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/rules", ruleRoutes);
app.use("/api/timetrack", timeTrackRoutes);

// Sync comments every minute
syncCommentJob();
syncGitlabJob();

// Close merged merge requests every minute
closeMergeMergeRequestsJob();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  logInfo(`Gitlab-Mochi backend running on port ${PORT}`)
);
