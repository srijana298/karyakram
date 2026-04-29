import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authMiddleware } from "../middleware/auth.js";
import * as ctrl from "../controllers/users.js";

const router = Router();

router.get("/", authMiddleware, asyncHandler(ctrl.listUsers));

export default router;
