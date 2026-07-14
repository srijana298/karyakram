import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as ctrl from "../controllers/categories.js";

const router = Router();

router.get("/", asyncHandler(ctrl.listCategories));

export default router;
