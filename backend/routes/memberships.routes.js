import { Router } from "express";
import {
  getMembershipsByGym,
  createMembership,
  assignMembershipToClient,
  getClientMemberships,
  updateMembership,
  deleteMembership,
} from "../controllers/memberships.controller.js";
import { verifyToken, isAdmin, isAdminOrTrainer } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/gym/:gym_id", verifyToken, isAdminOrTrainer, getMembershipsByGym);
router.post("/", verifyToken, isAdmin, createMembership);
router.post("/assign", verifyToken, isAdmin, assignMembershipToClient);
router.get("/client/:client_id", verifyToken, getClientMemberships);
router.put("/:id", verifyToken, isAdmin, updateMembership);
router.delete("/:id", verifyToken, isAdmin, deleteMembership);


export default router;