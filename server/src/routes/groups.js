import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authMiddleware } from "../middleware/auth.js";
import * as ctrl from "../controllers/groups.js";

const router = Router();

router.post("/", authMiddleware, asyncHandler(ctrl.createGroup));
router.get("/", authMiddleware, asyncHandler(ctrl.listGroups));
router.get("/:id", authMiddleware, asyncHandler(ctrl.getGroup));
router.patch("/:id", authMiddleware, asyncHandler(ctrl.updateGroup));
router.delete("/:id", authMiddleware, asyncHandler(ctrl.deleteGroup));
router.get("/:id/stats", authMiddleware, asyncHandler(ctrl.groupStats));
router.get("/:id/attendance-summary", authMiddleware, asyncHandler(ctrl.groupAttendanceSummary));
router.get("/:id/conflicts", authMiddleware, asyncHandler(ctrl.groupConflicts));

export default router;
