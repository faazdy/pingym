import { Router } from "express";
import { getClients, createClient } from "../controllers/clients.controller.js";

import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", verifyToken, getClients);
router.post("/", verifyToken, createClient);

export default router;