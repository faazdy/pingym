// progress.routes

import { Router } from "express";
import { recordProgress, getClientProgress } from "../controllers/progress.controller.js";
import { verifyToken, requireGymOrOwnClient } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", verifyToken, recordProgress);
router.get("/client/:client_id", verifyToken, requireGymOrOwnClient("client_id"), getClientProgress);

export default router;
