import bcrypt from "bcrypt";
import { User } from "../Models/user.model.js";
import { Otp } from "../Models/otpModels.js";
import { createOrUpdateOtp,sendOtpMail} from "./Otp.service.js";

import crypto from "crypto"
import { Referral } from "../Models/referral.model.js";
import { creditWallet } from "./Product/wallet.service.js";


const generateReferralCode = (username) => {
 return username + Math.floor(1000 + Math.random()*9000);
};


export const signupUser = async (data) => {
  let {
    fullName,
    username,
    email,
    referralCode,
    password,
    confirmPassword
  } = data;

  
  fullName = fullName?.trim();
  username = username?.trim();
  email = email?.trim().toLowerCase();


  if (!fullName || !username || !email || !password || !confirmPassword) {
    throw new Error("All fields are required");
  }


  const fullNameRegex = /^(?=.*[A-Za-z])[A-Za-z -]{3,30}$/;
  if (!fullNameRegex.test(fullName)) {
    throw new Error("Invalid full name");
  }

  const usernameRegex = /^(?=.*[a-zA-Z0-9])[a-zA-Z0-9_-]{3,15}$/;
  if (!usernameRegex.test(username)) {
    throw new Error("Invalid username");
  }

  const emailRegex = /^[a-zA-Z0-9](?!.*\.\.)[a-zA-Z0-9._%+-]{2,}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email format");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  const strongPasswordRegex =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;

  if (!strongPasswordRegex.test(password)) {
    throw new Error(
      "Password must include uppercase, lowercase, number and special character"
    );
  }

  if (password !== confirmPassword) {
    throw new Error("Passwords do not match");
  }

  const userExists = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (userExists) {
    throw new Error("User already exists");
  }

  await createOrUpdateOtp({
    fullName,
    username,
    email,
    referralCode: referralCode || null,
    password
  });

  return true;
};

export const verifyOtp = async (email, otp) => {
  const record = await Otp.findOne({ email });

  if (!record) throw new Error("OTP not found");
  if (record.expiresAt < Date.now()) throw new Error("OTP expired");
  if (record.otp !== otp) throw new Error("Invalid OTP");
    
  
  const hashedPassword = await bcrypt.hash(record.signupData.password, 10);

  const generatedReferralCode = generateReferralCode(record.signupData.username);

  const referrer = record.signupData.referralCode
 ? await User.findOne({ referralCode: record.signupData.referralCode })
 : null;

const newUser = await User.create({
 fullName: record.signupData.fullName,
 username: record.signupData.username,
 email: record.signupData.email,
 password: hashedPassword,
 referralCode: generatedReferralCode,
 referredBy: referrer ? referrer._id : null,
 isVerified: true
});

console.log("Entered referral:", record.signupData.referralCode);
console.log("Referrer found:", referrer);
console.log("New user created:", newUser._id);

if (referrer) {

  // save referral record
  await Referral.create({
    referrer: referrer._id,
    referredUser: newUser._id,
    reward: 100,
    status: "Completed"
  });

  // ✅ Reward referrer
  await creditWallet(
    referrer._id,
    100,
    null,
    "Referral Reward",
    newUser.username
  );

  // ✅ Reward NEW USER (IMPORTANT FIX)
  await creditWallet(
    newUser._id,
    100,
    null,
    "Referral Bonus",
    referrer.username
  );

  console.log("Referral rewards given to both users");
}

  await Otp.deleteOne({ email });

  return true;
};

export const loginUser = async (data) => {
  const { identifier, password } = data;

  const user = await User.findOne({
    $or: [{ email: identifier }, { username: identifier }]
  });

  if (!user) {
    throw new Error("Invalid email/username or password");
  }

  
  if (user.isBlocked) {
    throw new Error("Your account is blocked. Please contact support.");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid email/username or password");
  }

  if (!user.isVerified) {
    throw new Error("Please verify your email before login");
  }

  return user;
};



export const sendForgotPasswordOtp = async (email, session) => {
  if (!email) throw new Error("Email is required");

  const user = await User.findOne({ email });
  if (!user) throw new Error("Email not registered");

  session.resetEmail = email;

  await createOrUpdateOtp({ email });

  return true;
};

export const verifyForgotOtp = async (otp, session) => {
  const email = session.resetEmail;
  if (!email) throw new Error("Session expired");

  const record = await Otp.findOne({ email });
  if (!record) throw new Error("OTP not found");
  if (record.expiresAt < Date.now()) throw new Error("OTP expired");
  if (record.otp !== otp) throw new Error("Invalid OTP");

  await Otp.deleteOne({ email });

  session.isResetVerified = true;
 
  return true;
};


export const resendSignupOtp = async(email) =>{
     const record = await Otp.findOne({email});

     if(!record) throw new Error("Session not found.please login");
       
     const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
     record.otp = otp;
     record.expiresAt = Date.now()+ 2*60*1000;
     await record.save();

     await sendOtpMail(email,otp);

     return true;
}

export const resendForgotPasswordOtp = async (session) => {

  const email = session.resetEmail;

  if (!email) {
    throw new Error("Session expired");
  }

  const record = await Otp.findOne({ email });

  if (!record) {
    throw new Error("OTP session not found");
  }

  const otp =
    Math.floor(100000 + Math.random() * 900000)
    .toString();

  record.otp = otp;

  record.expiresAt =
    Date.now() + 2 * 60 * 1000;

  await record.save();

  await sendOtpMail(email, otp);

  return true;
};


export const resetPassword = async (data, session) => {
  const { password, confirmPassword } = data;

  if (!session.isResetVerified &&   !session.isPasswordVerified
)
    throw new Error("Unauthorized password reset");

  if (!password || !confirmPassword)
    throw new Error("All fields required");

  if (password !== confirmPassword)
    throw new Error("Passwords do not match");

  const hashed = await bcrypt.hash(password, 10);

  await User.findOneAndUpdate(
    { email: session.resetEmail },
    { password: hashed }
  );

  
  session.resetEmail = null;
  session.isResetVerified = null;
  session.isPasswordVerified = null;

  return true;
};


export const verifyOldPassword = async (
  userId,
  oldPassword,
  session
) => {

  if (!oldPassword) {
    throw new Error(
      "Old password is required"
    );
  }

  const user = await User.findById(
    userId
  );

  if (!user) {
    throw new Error("User not found");
  }

  const isMatch = await bcrypt.compare(
    oldPassword,
    user.password
  );

  if (!isMatch) {
    throw new Error(
      "Entered old password is incorrect"
    );
  }

  session.isPasswordVerified = true;
  session.resetEmail = user.email;

  return true;

};

export const getUserByIdService = async (
  userId
) => {

  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  return user;

};