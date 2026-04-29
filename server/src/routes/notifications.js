import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authMiddleware } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createNotificationSchema } from "../validators/notifications.js";
import * as ctrl from "../controllers/notifications.js";

const router = Router();

router.get("/", authMiddleware, asyncHandler(ctrl.listNotifications));
router.post("/", authMiddleware, validate(createNotificationSchema), asyncHandler(ctrl.createNotification));
router.patch("/:id/read", authMiddleware, asyncHandler(ctrl.markRead));

export default router;
