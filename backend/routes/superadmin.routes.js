import { Router } from "express";
import { verifyToken, verifySuperAdmin } from "../middleware/auth.middleware.js";
import { createGymWithAdmin, getAllGyms, getStats, deleteGym } from "../controllers/superadmin.controller.js";

const router = Router();

router.post("/create-gym", verifyToken, verifySuperAdmin, createGymWithAdmin);
router.get("/gyms", verifyToken, verifySuperAdmin, getAllGyms);
router.get("/stats", verifyToken, verifySuperAdmin, getStats);
router.delete("/gyms/:id", verifyToken, verifySuperAdmin, deleteGym);

export default router;
