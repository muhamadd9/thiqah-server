import Joi from "joi";
import { generalFeilds } from "../../middleware/validation.middleware.js";

export const userIdSchema = Joi.object()
    .keys({
        id: generalFeilds.id.required(),
    })
    .required();

// Logged-in user updating their own profile
export const updateProfileSchema = Joi.object()
    .keys({
        fullname: Joi.string().min(3).max(100).optional(),
    })
    .required();

// Admin creating a new user
export const adminCreateUserSchema = Joi.object()
    .keys({
        fullname: Joi.string().min(3).max(100).required(),
        email: generalFeilds.email.optional(),
        phone: Joi.string().min(6).max(20).optional(),
        password: generalFeilds.password.required(),
        role: Joi.string().valid("admin", "user").required(),
    })
    .required();

// Admin updating an existing user
export const adminUpdateUserSchema = Joi.object()
    .keys({
        id: generalFeilds.id.required(),
        fullname: Joi.string().min(3).max(100).optional(),
        email: generalFeilds.email.optional(),
        phone: Joi.string().min(6).max(20).optional(),
        password: generalFeilds.password.optional(),
        role: Joi.string().valid("admin", "user").optional(),
    })
    .required();

