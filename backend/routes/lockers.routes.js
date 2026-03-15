import { Router } from "express";
import { getLockersByGym, getMyLocker, assignLocker, releaseLocker, createLocker, deleteLocker } from "../controllers/lockers.controller.js";
import { verifyToken, isAdmin, requireGym } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/my", verifyToken, requireGym, getMyLocker);
router.get("/:gym_id", verifyToken, requireGym, isAdmin, getLockersByGym);
router.post("/", verifyToken, requireGym, isAdmin, createLocker); 
router.post("/assign", verifyToken, requireGym, isAdmin, assignLocker);
router.post("/release", verifyToken, requireGym, isAdmin, releaseLocker);
router.delete("/:id", verifyToken, requireGym, isAdmin, deleteLocker);

export default router;