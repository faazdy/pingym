import { Router } from "express";
import {
  getExercises,
  createExercise,
  updateExercise,
  deleteExercise,
} from "../controllers/exercises.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();

// Todos los autenticados pueden listar o crear ejercicios
router.get("/",    verifyToken, getExercises);
router.post("/",   verifyToken, createExercise);

// Solo el propietario (o staff del gym) puede editar / eliminar
router.put("/:id",    verifyToken, updateExercise);
router.delete("/:id", verifyToken, deleteExercise);

export default router;
