import Joi from "joi";
import { generalFeilds } from "../../middleware/validation.middleware.js";

export const analyzeFileSchema = Joi.object()
    .keys({
        fileId: generalFeilds.id.required()
    })
    .required();

export const getAnalysisResultSchema = Joi.object()
    .keys({
        fileId: generalFeilds.id.required()
    })
    .required();
