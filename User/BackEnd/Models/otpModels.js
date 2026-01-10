import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  otp: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },

  signupData: {
    fullName: String,
    username: String,
    email: String,
    password: String
  }
});

export const Otp = mongoose.model("Otp", otpSchema);
