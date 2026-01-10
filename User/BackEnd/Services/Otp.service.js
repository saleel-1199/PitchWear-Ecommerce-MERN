import nodemailer from "nodemailer";
import { Otp } from "../Models/otpModels.js";

/* Generate 6-digit OTP */
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/* Mail transporter */
console.log(process.env.EMAIL, process.env.EMAIL_PASSWORD);
const transporter = nodemailer.createTransport({
  
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
    
  }
});

/* Send OTP mail */
const sendOtpMail = async (email, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject: "Email Verification - OTP",
    html: `
      <h3>Your OTP is: <b>${otp}</b></h3>
      <p>This OTP is valid for 30 seconds.</p>
    `
  });
};

/* Create or update OTP record */
export const createOrUpdateOtp = async (signupData) => {
  const { email } = signupData;
  const otp = generateOtp();

  // Remove old OTP if exists
  await Otp.deleteMany({ email });

  // Store temp signup data + OTP
  await Otp.create({
    email,
    otp,
    expiresAt: Date.now() + 90 * 1000,
    signupData
  });

  await sendOtpMail(email, otp);
};
