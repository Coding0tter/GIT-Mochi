import express from "express";
import cors from "cors";
import http from "http";
import { connect } from "mongoose";
import taskRoutes from "./backend/routes/taskRoutes";
import gitlabRoutes from "./backend/routes/gitlabRoutes";
import projectRoutes from "./backend/routes/projectRouter";
import { logError, logInfo } from "./backend/utils/logger";
import { globalErrorHandler } from "./backend/middlewares/globalErrorHandler";
import { SocketHandler } from "./backend/sockets";
import { syncCommentJob } from "./backend/background-jobs/commentSync";
import { syncGitlabJob } from "./backend/background-jobs/gitlabSync";
import { GitlabService } from "./backend/services/gitlabService";
import { MochiError } from "./backend/utils/error";

const app = express();
const server = http.createServer(app);
SocketHandler.getInstance().init(server);

app.use(cors());
app.use(express.json());
app.use(globalErrorHandler);

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

// Sync comments every minute
syncCommentJob();
syncGitlabJob();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  logInfo(`Gitlab-Mochi backend running on port ${PORT}`)
);
