import { Router } from "express";
import { register, login, registerGym } from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/registergym", registerGym)

export default router;