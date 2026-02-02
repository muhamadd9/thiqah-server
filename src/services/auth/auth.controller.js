import { validate } from "../../middleware/validation.middleware.js";
import * as authService from "./auth.service.js";

import Router from "express";
import { signupSchema, loginSchema, resetPasswordSchema } from "./auth.validation.js";

const authRouter = Router();

authRouter.post("/signup", validate(signupSchema), authService.signup);
authRouter.post("/login", validate(loginSchema), authService.login);
authRouter.post("/forgot-password", authService.forgotPassword);
authRouter.post("/reset-password/:id", validate(resetPasswordSchema), authService.resetPassword);

// Thin controller exports for unit tests – delegate directly to service
export const signup = (req, res, next) => authService.signup(req, res, next);
export const login = (req, res, next) => authService.login(req, res, next);
export const forgotPassword = (req, res, next) => authService.forgotPassword(req, res, next);
export const resetPassword = (req, res, next) => authService.resetPassword(req, res, next);

export default authRouter;
