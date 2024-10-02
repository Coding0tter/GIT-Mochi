import express from "express";
import cors from "cors";
import { connect } from "mongoose";
import taskRoutes from "./backend/routes/taskRoutes";
import gitlabRoutes from "./backend/routes/gitlabRoutes";
import projectRoutes from "./backend/routes/projectRouter";
import { periodicallySyncComments } from "./backend/utils/commentSync";
import { logError, logInfo } from "./backend/utils/logger";
import { globalErrorHandler } from "./backend/middlewares/globalErrorHandler";

const app = express();
app.use(cors());
app.use(express.json());
app.use(globalErrorHandler);

connect("mongodb://mongo:27017/kanban", {})
  .then(() => logInfo("MongoDB connected"))
  .catch((err) => logError(err));

app.use("/api/tasks", taskRoutes);
app.use("/api/git", gitlabRoutes);
app.use("/api/projects", projectRoutes);

// Sync comments every minute
periodicallySyncComments();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => logInfo(`Gitlab-Mochi backend running on port ${PORT}`));
