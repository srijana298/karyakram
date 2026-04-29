import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authMiddleware } from "../middleware/auth.js";
import * as ctrl from "../controllers/attendance.js";

const router = Router();

router.get("/events/:id/attendance", authMiddleware, asyncHandler(ctrl.listAttendance));
router.post("/events/:id/attendance", authMiddleware, asyncHandler(ctrl.markAttendance));
router.post("/events/:id/attendance/bulk", authMiddleware, asyncHandler(ctrl.bulkAttendance));
router.post("/events/:id/checkin/code", authMiddleware, asyncHandler(ctrl.generateCheckInCode));
router.post("/events/:id/checkin", authMiddleware, asyncHandler(ctrl.selfCheckIn));

export default router;
