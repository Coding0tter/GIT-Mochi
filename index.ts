import express from "express";
import cors from "cors";
import { connect } from "mongoose";
import taskRoutes from "./routes/taskRoutes";
import gitlabRoutes from "./routes/gitlabRoutes";
import projectRoutes from "./routes/projectRouter";
import { periodicallySyncComments } from "./utils/commentSync";
import { logError, logInfo } from "./utils/logger";

const app = express();
app.use(cors());
app.use(express.json());

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
