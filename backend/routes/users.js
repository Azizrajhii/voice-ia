import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { getMe, updateMe, changePassword, deleteAccount } from "../controllers/usersController.js";

const router = express.Router();

router.get("/me", requireAuth, getMe);
router.patch("/me", requireAuth, updateMe);
router.patch("/me/password", requireAuth, changePassword);
router.delete("/me", requireAuth, deleteAccount);

export default router;
