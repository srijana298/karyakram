import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authMiddleware } from "../middleware/auth.js";
import * as ctrl from "../controllers/members.js";

const router = Router();

router.get("/events/:id/members", authMiddleware, asyncHandler(ctrl.listMembers));
router.delete("/events/:id/members/:memberId", authMiddleware, asyncHandler(ctrl.removeMember));
router.patch("/events/:id/members/:memberId/attend", authMiddleware, asyncHandler(ctrl.markAttendance));

export default router;
