import { Router } from "express";
import { checkIn, getAttendanceHistory, getMyAttendance } from "../controllers/attendance.controller.js";
import { verifyToken, isAdminOrTrainer, requireGym } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/check-in", verifyToken, requireGym, isAdminOrTrainer, checkIn);
router.get("/my", verifyToken, requireGym, getMyAttendance);
router.get("/:gym_id", verifyToken, requireGym, isAdminOrTrainer, getAttendanceHistory);

export default router;
