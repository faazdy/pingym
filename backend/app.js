import express from "express";
import cors from "cors";

import clientsRoutes from "./routes/clients.routes.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/clients", clientsRoutes);

export default app;