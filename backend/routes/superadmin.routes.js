import { Router } from "express";
import { verifyToken, verifySuperAdmin } from "../middleware/auth.middleware.js";
import { createGymWithAdmin, getAllGyms } from "../controllers/superadmin.controller.js";

const router = Router();

router.post("/create-gym", verifyToken, verifySuperAdmin, createGymWithAdmin);
router.get("/gyms", verifyToken, verifySuperAdmin, getAllGyms);

export default router;
