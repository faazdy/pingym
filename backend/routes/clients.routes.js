import { Router } from "express";
import { getClients, getClientById, updateClient, deleteClient } from "../controllers/clients.controller.js";
import { verifyToken, isAdmin } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/:gym_id", verifyToken, getClients);
router.get("/detail/:id_client", verifyToken, getClientById);
router.put("/detail/:id_client", verifyToken, isAdmin, updateClient);
router.delete("/:id_user", verifyToken, isAdmin, deleteClient);

export default router;