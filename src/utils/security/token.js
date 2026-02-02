import jwt from "jsonwebtoken";
import { findOne } from "../../DB/dbService.js";
import userModel from "../../DB/model/User.model.js";

export const tokenTypes = {
  access: "access",
};

export const decodedToken = async ({ authorization }) => {
  const [bearer, token] = authorization?.split(" ") || [];
  if (!bearer || !token) {
    throw new Error("Invalid token");
  }

  const decoded = verifyToken({
    token,
    signature: process.env.USER_ACCESS_TOKEN,
  });

  if (!decoded?.id) {
    throw new Error("Invalid token");
  }

  const user = await findOne({
    model: userModel,
    filter: { _id: decoded.id },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.changeCredentialsTime?.getTime() > decoded.iat * 1000) {
    throw new Error("Invalid token , Please login again");
  }

  return user;
};

export const createToken = ({ payload = {}, signature = process.env.USER_ACCESS_TOKEN, expiresIn = 60 * 60 * 180 * 1000 }) => {
  const token = jwt.sign(payload, signature, {
    expiresIn: expiresIn,
  });

  return token;
};

export const verifyToken = ({ token, signature = process.env.USER_ACCESS_TOKEN }) => {
  const decoded = jwt.verify(token, signature);

  return decoded;
};
