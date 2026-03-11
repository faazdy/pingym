import { Router } from "express";
import { getClients, getClientById, updateClient, deleteClient } from "../controllers/clients.controller.js";

import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/:gym_id", verifyToken, getClients);
router.get("/client/:id_client", verifyToken, getClientById);
router.put("/client/:id_client", verifyToken, updateClient);
router.delete("/client/:id_user", verifyToken, deleteClient);


export default router;