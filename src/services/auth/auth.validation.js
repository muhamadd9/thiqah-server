import Joi from "joi";
import { generalFeilds } from "../../middleware/validation.middleware.js";

export const signupSchema = Joi.object()
  .keys({
    fullname: Joi.string().min(3).max(100).required(),
    email: generalFeilds.email.required(),
    password: generalFeilds.password.required(),
  })
  .required();

export const loginSchema = Joi.object()
  .keys({
    email: generalFeilds.email.required(),
    password: generalFeilds.password.required(),
  })
  .required();
export const resetPasswordSchema = Joi.object()
  .keys({
    id: generalFeilds.id.required(),
    password: generalFeilds.password.required(),
  })
  .required();
