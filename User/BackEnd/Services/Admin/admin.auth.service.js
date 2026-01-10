import bcrypt from "bcrypt";
import { Admin } from "../../Models/admin.models.js";

export const findAdminByEmail = async (email) => {
  return Admin.findOne({ email });
};

export const verifyAdminPassword = async (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};
