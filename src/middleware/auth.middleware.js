import { asyncHandler } from "../utils/response/error.response.js";
import { decodedToken } from "../utils/security/token.js";
export const authentication = () => {
  return asyncHandler(async (req, res, next) => {
    const { authorization } = req.headers;
    const user = await decodedToken({ authorization });
    req.user = user;
    next();
  });
};

// Optional authentication - doesn't fail if no token provided
export const optionalAuthentication = () => {
  return asyncHandler(async (req, res, next) => {
    const { authorization } = req.headers;
    if (authorization) {
      try {
        const user = await decodedToken({ authorization });
        req.user = user;
      } catch (err) {
        // Silently fail, continue without user
      }
    }
    next();
  });
};

export const authorization = (allowedRoles = []) => {
  return asyncHandler(async (req, res, next) => {
    if (!allowedRoles.length) return next();
    const userRole = req.user?.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      return next(new Error("Forbidden", { cause: 403 }));
    }
    return next();
  });
};
