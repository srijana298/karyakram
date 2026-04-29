import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authMiddleware } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { signupSchema, loginSchema, updateMeSchema } from "../validators/auth.js";
import * as ctrl from "../controllers/auth.js";

const router = Router();

router.post("/signup", validate(signupSchema), asyncHandler(ctrl.signup));
router.post("/login", validate(loginSchema), asyncHandler(ctrl.login));
router.get("/me", authMiddleware, asyncHandler(ctrl.getMe));
router.patch("/me", authMiddleware, validate(updateMeSchema), asyncHandler(ctrl.updateMe));

export default router;
