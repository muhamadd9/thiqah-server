import Joi from "joi";
import { generalFeilds } from "../../middleware/validation.middleware.js";

export const uploadFileSchema = Joi.object()
    .keys({
        file: Joi.any().required()
    })
    .required();

export const getFileByIdSchema = Joi.object()
    .keys({
        fileId: generalFeilds.id.required()
    })
    .required();
