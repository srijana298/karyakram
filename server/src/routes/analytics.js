import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authMiddleware } from "../middleware/auth.js";
import * as ctrl from "../controllers/analytics.js";

const router = Router();

router.get("/", authMiddleware, asyncHandler(ctrl.getAnalytics));

export default router;
