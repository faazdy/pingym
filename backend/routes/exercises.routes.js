import { Router } from "express";
import { getExercises, createExercise } from "../controllers/exercises.controller.js";
import { verifyToken, isAdmin, requireGym } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", verifyToken, getExercises);
router.post("/", verifyToken, requireGym, isAdmin, createExercise);

export default router;
