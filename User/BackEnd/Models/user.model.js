import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },

    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    referralCode: {
      type: String,
      default: null
    },
    isBlocked: { 
      type: Boolean, 
      default: false 
    },

    password: {
      type: String,
      required: true
    },

    isVerified: {
      type: Boolean,
      default: false
    },
    profileImage:{
      type:String,
      default:null
    },
    phone_no: { 
      type: String, 
      default: null 
    },
    authProvider: {
   type: String,
    enum: ["local", "google"],
   default: "local",
}
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
