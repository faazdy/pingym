import { Router } from "express";
import { verifyToken, isAdmin } from "../middleware/auth.middleware.js";
import {
  register,
  registerUser,
  login,
  deleteGym,
  updateGym,
  deleteUser,
  updateUser
} from "../controllers/auth.controller.js";

const router = Router();

// ─── Públicas ────────────────────────────────────────────────────
router.post("/register", register);       // client independiente o admin+gym
router.post("/login", login);

// ─── Solo admins (desde el dashboard) ───────────────────────────
router.post("/register-user", verifyToken, isAdmin, registerUser);  // crear trainer o client

// ─── CRUD Gym ────────────────────────────────────────────────────
router.put("/gym/:id_gym", verifyToken, isAdmin, updateGym);
router.delete("/gym/:id_gym", verifyToken, isAdmin, deleteGym);

// ─── CRUD Users ──────────────────────────────────────────────────
router.put("/user/:id_user", verifyToken, isAdmin, updateUser);
router.delete("/user/:id_user", verifyToken, isAdmin, deleteUser);

export default router;