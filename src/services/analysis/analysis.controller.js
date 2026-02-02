import { Router } from "express";
import * as analysisController from "./analysis.service.js";
import { authentication } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validation.middleware.js";
import { analyzeFileSchema, getAnalysisResultSchema } from "./analysis.validation.js";

const router = Router();

router.post("/analyze/:fileId", authentication(), validate(analyzeFileSchema), analysisController.analyzeFile);
router.get("/result/:fileId", authentication(), validate(getAnalysisResultSchema), analysisController.getAnalysisResult);

export default router;
