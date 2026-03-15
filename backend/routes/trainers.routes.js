import { Router } from "express";
import { getTrainers, registerTrainer, updateTrainer, deleteTrainer } from "../controllers/trainers.controller.js";
import { verifyToken, isAdmin } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", verifyToken, isAdmin, getTrainers);
router.post("/", verifyToken, isAdmin, registerTrainer);
router.put("/:id", verifyToken, isAdmin, updateTrainer);
router.delete("/:id", verifyToken, isAdmin, deleteTrainer);

export default router;