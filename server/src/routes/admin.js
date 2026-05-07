import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authMiddleware } from "../middleware/auth.js";
import { adminMiddleware } from "../middleware/admin.js";
import * as ctrl from "../controllers/admin.js";

const router = Router();

// All /api/admin/* routes require auth + admin role
router.use(authMiddleware, adminMiddleware);

// Platform analytics
router.get("/stats", asyncHandler(ctrl.platformStats));

// All events across organizers
router.get("/events", asyncHandler(ctrl.listAllEvents));

// All groups
router.get("/groups", asyncHandler(ctrl.listAllGroups));

// User management
router.get("/users", asyncHandler(ctrl.listUsers));
router.patch("/users/:id", asyncHandler(ctrl.updateUserRole));
router.delete("/users/:id", asyncHandler(ctrl.deleteUser));

export default router;
