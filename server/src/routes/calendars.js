import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authMiddleware, optionalAuth } from "../middleware/auth.js";
import * as ctrl from "../controllers/calendars.js";
import { upload } from "../middleware/upload.js";

const router = Router();

// Public reads use optionalAuth so is_following is populated when a token is
// present, but the page still works for logged-out visitors.
router.get("/", optionalAuth, asyncHandler(ctrl.listCalendars));
router.get("/:id", optionalAuth, asyncHandler(ctrl.getCalendar));
router.post("/", authMiddleware, upload.fields([{ name: "avatar", maxCount: 1 }, { name: "cover", maxCount: 1 }]), asyncHandler(ctrl.createCalendar));

router.post("/:id/follow", authMiddleware, asyncHandler(ctrl.followCalendar));
router.delete("/:id/follow", authMiddleware, asyncHandler(ctrl.unfollowCalendar));

export default router;
