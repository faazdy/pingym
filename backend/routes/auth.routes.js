import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { register, login, registerGym, deleteGym, updateGym, deleteUser, updateUser } from "../controllers/auth.controller.js";

const router = Router();

//auth
router.post("/register", register);
router.post("/login", login);

//crud GYM
router.post("/gym/register", verifyToken, registerGym)
router.delete("/gym/:id_gym", verifyToken, deleteGym)
router.put("/gym/:id_gym", verifyToken, updateGym)

// crud users
router.put("/user/:id_user", verifyToken, updateUser)
router.delete("/user/:id_user", verifyToken, deleteUser)

export default router;