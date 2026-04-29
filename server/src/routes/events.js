import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authMiddleware } from "../middleware/auth.js";
import { validate, validateQuery } from "../middleware/validate.js";
import { upload } from "../middleware/upload.js";
import { createEventSchema, updateEventSchema, eventQuerySchema } from "../validators/events.js";
import * as ctrl from "../controllers/events.js";

const router = Router();

router.post("/", authMiddleware, validate(createEventSchema), asyncHandler(ctrl.createEvent));
router.get("/", authMiddleware, validateQuery(eventQuerySchema), asyncHandler(ctrl.listEvents));
router.get("/:id", asyncHandler(ctrl.getEvent));
router.patch("/:id", authMiddleware, validate(updateEventSchema), asyncHandler(ctrl.updateEvent));
router.delete("/:id", authMiddleware, asyncHandler(ctrl.deleteEvent));
router.post("/:id/image", authMiddleware, upload.single("image"), asyncHandler(ctrl.uploadEventImage));

export default router;
