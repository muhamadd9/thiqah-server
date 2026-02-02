import Router from "express";
import { authentication, authorization } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validation.middleware.js";
import { userIdSchema, updateProfileSchema, adminCreateUserSchema, adminUpdateUserSchema } from "./user.validation.js";
import * as userService from "./user.service.js";

const userRouter = Router();

// Authenticated route - Get current user (must be before /:id to avoid route conflict)
userRouter.get("/me", authentication(), authorization(), userService.getMe);

// Public route - Get user by ID (profile viewing)
userRouter.get("/:id", validate(userIdSchema), userService.getUserById);

// Authenticated routes
userRouter.use(authentication(), authorization());

userRouter.get("/", userService.getAllUsers);
userRouter.post("/", validate(adminCreateUserSchema), authorization(['admin']), userService.createUser);
userRouter.patch("/:id", validate(adminUpdateUserSchema), authorization(['admin']), userService.updateUser);
userRouter.delete("/:id", validate(userIdSchema), authorization(['admin']), userService.deleteUser);

// Profile update endpoint (only for own profile)
userRouter.patch("/me/profile", validate(updateProfileSchema), userService.updateProfile);

export default userRouter;



