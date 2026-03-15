import express from "express";
import cors from "cors";

import clientsRoutes from "./routes/clients.routes.js";
import authRoutes from "./routes/auth.routes.js";
import membershipsRoutes from "./routes/memberships.routes.js";
import routinesRoutes from "./routes/routines.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import lockersRoutes from "./routes/lockers.routes.js";
import progressRoutes from "./routes/progress.routes.js";
import postsRoutes from "./routes/posts.routes.js";
import exercisesRoutes from "./routes/exercises.routes.js";
import qrRoutes from "./routes/qr.routes.js";
import trainersRoutes from "./routes/trainers.routes.js"


const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/clients", clientsRoutes);
app.use("/api/memberships", membershipsRoutes);
app.use("/api/routines", routinesRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/lockers", lockersRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/exercises", exercisesRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/trainers", trainersRoutes);

export default app;