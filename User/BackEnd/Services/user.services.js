import bcrypt from "bcrypt"
import { User } from "../Models/user.model.js";
import { createOrUpdateOtp } from "./Otp.service.js";
import { Otp } from "../Models/otpModels.js"; 


export const getUserById = async (userId) => {
  if (!userId) return null;

  const user = await User.findById(userId).lean();
  return user;
};


export const updateUserProfile = async (userId, data) => {
  const { fullName, password, confirmPassword } = data;

  const updateData = { fullName };

  
  if (password || confirmPassword) {
    if (!password || !confirmPassword) {
      throw new Error("Both password fields are required");
    }

    if (password !== confirmPassword) {
      throw new Error("Passwords do not match");
    }

    updateData.password = await bcrypt.hash(password, 10);
  }

  await User.findByIdAndUpdate(userId, updateData);
};



export const sendEmailChangeOtp = async (userId, newEmail) => {
  if (!newEmail) throw new Error("Email is required");

  const exists = await User.findOne({ email: newEmail });
  if (exists) throw new Error("Email already in use");

  await createOrUpdateOtp({ email: newEmail });

  return true;
};


export const verifyEmailChangeOtp  = async (userId,otp) =>{
    const record = await Otp.findOne({otp});

     if (!record) throw new Error("Invalid OTP");
     if (record.expiresAt < Date.now()) {
    throw new Error("OTP expired");
  }
    await User.findByIdAndUpdate(userId,{
        email:record.email
    })

    await Otp.deleteOne({_id:record._id});
};

export const updateProfileImage = async (userId, imagePath) => {
  await User.findByIdAndUpdate(userId, {
    profileImage: imagePath
  });
};