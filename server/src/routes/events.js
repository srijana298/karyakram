import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authMiddleware, optionalAuth } from "../middleware/auth.js";
import { validate, validateQuery } from "../middleware/validate.js";
import { upload } from "../middleware/upload.js";
import { createEventSchema, updateEventSchema, eventQuerySchema, inviteGuestsSchema } from "../validators/events.js";
import * as ctrl from "../controllers/events.js";

const router = Router();

router.post("/", authMiddleware, validate(createEventSchema), asyncHandler(ctrl.createEvent));
router.get("/", optionalAuth, validateQuery(eventQuerySchema), asyncHandler(ctrl.listEvents));
router.get("/code/:code", asyncHandler(ctrl.getEventByCode));
router.patch("/invitations/:token/accept", authMiddleware, asyncHandler(ctrl.acceptInvitation));
router.patch("/invitations/:token/reject", authMiddleware, asyncHandler(ctrl.rejectInvitation));
router.get("/:id", asyncHandler(ctrl.getEvent));
router.patch("/:id", authMiddleware, validate(updateEventSchema), asyncHandler(ctrl.updateEvent));
router.delete("/:id", authMiddleware, asyncHandler(ctrl.deleteEvent));
router.post("/:id/image", authMiddleware, upload.single("image"), asyncHandler(ctrl.uploadEventImage));
router.get("/:id/invitations", authMiddleware, asyncHandler(ctrl.listInvitations));
router.post("/:id/invitations", authMiddleware, validate(inviteGuestsSchema), asyncHandler(ctrl.inviteGuests));

export default router;
