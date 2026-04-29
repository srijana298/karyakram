import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authMiddleware } from "../middleware/auth.js";
import { validateQuery } from "../middleware/validate.js";
import { rsvpQuerySchema } from "../validators/rsvps.js";
import * as ctrl from "../controllers/rsvps.js";

const router = Router();

router.post("/:id", authMiddleware, asyncHandler(ctrl.createRsvp));
router.get("/:id/rsvps", authMiddleware, asyncHandler(ctrl.listRsvpsForEvent));
router.get("/", authMiddleware, validateQuery(rsvpQuerySchema), asyncHandler(ctrl.listMyRsvps));
router.patch("/:id/approve", authMiddleware, asyncHandler(ctrl.approveRsvp));
router.patch("/:id/reject", authMiddleware, asyncHandler(ctrl.rejectRsvp));

export default router;
