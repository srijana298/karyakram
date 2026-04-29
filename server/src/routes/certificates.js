import { Router } from "express";
import multer from "multer";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authMiddleware } from "../middleware/auth.js";
import * as ctrl from "../controllers/certificates.js";

const router = Router();
const upload = multer({ dest: "uploads/templates/", limits: { fileSize: 10 * 1024 * 1024 } });

router.get("/templates", authMiddleware, asyncHandler(ctrl.listTemplates));
router.post("/templates", authMiddleware, upload.single("background"), asyncHandler(ctrl.createTemplate));
router.get("/templates/:id", authMiddleware, asyncHandler(ctrl.getTemplate));
router.patch("/templates/:id", authMiddleware, upload.single("background"), asyncHandler(ctrl.updateTemplate));
router.delete("/templates/:id", authMiddleware, asyncHandler(ctrl.deleteTemplate));
router.post("/events/:id/generate", authMiddleware, asyncHandler(ctrl.generateForEvent));
router.get("/events/:id", authMiddleware, asyncHandler(ctrl.listForEvent));
router.get("/mine", authMiddleware, asyncHandler(ctrl.listMine));
router.get("/verify/:code", asyncHandler(ctrl.verifyCode));

export default router;
