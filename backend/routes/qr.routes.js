import { Router } from "express";
import { getRegisterQrData } from "../controllers/qr.controller.js";
import { verifyToken, requireGym, isAdmin } from "../middleware/auth.middleware.js";

const router = Router();

// Público: solo devuelve datos para generar QR (sin datos sensibles)
router.get("/register/:gym_id", getRegisterQrData);
// Con token: solo admin del gym puede generar/ver QR de registro
router.get("/register/:gym_id/secure", verifyToken, requireGym, isAdmin, getRegisterQrData);

export default router;
