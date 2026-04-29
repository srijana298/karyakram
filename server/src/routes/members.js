import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authMiddleware } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { inviteMemberSchema, acceptInviteSchema } from "../validators/members.js";
import * as ctrl from "../controllers/members.js";

const router = Router();

router.get("/invites/received", authMiddleware, asyncHandler(ctrl.receivedInvites));
router.get("/invites/sent", authMiddleware, asyncHandler(ctrl.sentInvites));
router.post("/events/:id/members", authMiddleware, validate(inviteMemberSchema), asyncHandler(ctrl.inviteMember));
router.get("/events/:id/members", authMiddleware, asyncHandler(ctrl.listMembers));
router.delete("/events/:id/members/:memberId", authMiddleware, asyncHandler(ctrl.removeMember));
router.patch("/events/:id/members/:memberId/attend", authMiddleware, asyncHandler(ctrl.markAttendance));
router.patch("/memberships/accept", authMiddleware, validate(acceptInviteSchema), asyncHandler(ctrl.acceptInvite));

export default router;
