import express from "express";
import cors from "cors";
import { connect } from "mongoose";
import taskRoutes from "./routes/taskRoutes";
import gitlabRoutes from "./routes/gitlabRoutes";
import { periodicallySyncComments } from "./utils/commentSync";
import { logError, logInfo } from "./utils/logger";

const app = express();
app.use(cors());
app.use(express.json());

connect("mongodb://mongo:27017/kanban", {})
  .then(() => logInfo("MongoDB connected"))
  .catch((err) => logError(err));

app.use("/tasks", taskRoutes);
app.use("/git", gitlabRoutes);

// Sync comments every minute
periodicallySyncComments();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => logInfo(`GIT-Mochi backend running on port ${PORT}`));
