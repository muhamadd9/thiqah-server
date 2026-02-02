import Joi from "joi";
import mongoose from "mongoose";

const validObjectId = (value, helpers) => {
  return mongoose.Types.ObjectId.isValid(value) ? true : helpers.message("in-Valid id");
};
export const generalFeilds = {
  name: Joi.string().min(6).max(50),
  email: Joi.string().email(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
  confirmPassword: Joi.string().valid(Joi.ref("password")),
  otp: Joi.string().min(4).max(4),
  id: Joi.string().custom(validObjectId),
  nationalId: Joi.string().min(6).max(20),
  nationalIdNumber: Joi.number().integer().min(1),
};

export const validate = (schema) => {
  return (req, res, next) => {
    const data = { ...req.params, ...req.query, ...req.body };

    // Do not inject implicit file fields here; upload middleware normalizes into req.body

    const result = schema.validate(data, { abortEarly: false });

    if (result.error) {
      const messageList = result.error.details.map((obj) => obj.message);

      return res.status(400).json({ success: false, message: messageList });
    }

    return next();
  };
};
