import { Router } from "express";
import {
  getPostsByGym,
  getPostById,
  createPost,
  updatePost,
  deletePost,
} from "../controllers/posts.controller.js";
import { verifyToken, isAdminOrTrainer, requireGym } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/gym/:gym_id", verifyToken, requireGym, getPostsByGym);
router.get("/detail/:id", verifyToken, requireGym, getPostById);
router.post("/", verifyToken, requireGym, isAdminOrTrainer, createPost);
router.put("/:id", verifyToken, requireGym, isAdminOrTrainer, updatePost);
router.delete("/:id", verifyToken, requireGym, isAdminOrTrainer, deletePost);

export default router;
