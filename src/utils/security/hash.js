import bcrypt from "bcrypt";

export const hashPassword = ({ plainText, salt = process.env.SALT } = {}) => {
  return bcrypt.hashSync(plainText, parseInt(salt));
};

export const compareHash = ({ plainText, hash } = {}) => {
  return bcrypt.compareSync(plainText, hash);
};
