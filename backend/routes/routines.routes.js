import { Router } from "express";
import {
  getRoutinesByGym,
  getMyRoutines,
  createRoutine,
  getRoutineExercises,
  assignRoutineToClient,
  getClientRoutines,
  addExerciseToRoutine,
  removeExerciseFromRoutine,
  deleteRoutine,
  unassignRoutineFromClient
} from "../controllers/routines.controller.js";
import { verifyToken, isAdminOrTrainer, requireGym, requireGymOrOwnClient } from "../middleware/auth.middleware.js";
import { getExercises } from "../controllers/routines.controller.js";

const router = Router();

router.get("/gym/:gym_id", verifyToken, requireGym, isAdminOrTrainer, getRoutinesByGym);
router.get("/my", verifyToken, getMyRoutines);
router.post("/", verifyToken, createRoutine);
router.get("/:routine_id/exercises", verifyToken, getRoutineExercises);
router.post("/assign", verifyToken, requireGym, isAdminOrTrainer, assignRoutineToClient);
router.get("/client/:client_id", verifyToken, requireGym, requireGymOrOwnClient("client_id"), getClientRoutines);
router.get("/exercises", verifyToken, getExercises);
router.post("/:routine_id/exercises", verifyToken, addExerciseToRoutine);
router.delete("/:routine_id/exercises/:exercise_id", verifyToken, removeExerciseFromRoutine);
router.delete("/:routine_id", verifyToken, deleteRoutine);
router.delete("/unassign", verifyToken, isAdminOrTrainer, unassignRoutineFromClient);

export default router;
