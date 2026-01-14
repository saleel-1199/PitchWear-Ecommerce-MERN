import nodemailer from "nodemailer";
import { Otp } from "../Models/otpModels.js";


const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const transporter = nodemailer.createTransport({
  
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
    
  }
});

export const sendOtpMail = async (email, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject: "Email Verification - OTP",
    html: `
      <h3>Your OTP is: <b>${otp}</b></h3>
     
    `
  });
};


export const createOrUpdateOtp = async (signupData) => {
  const { email } = signupData;
  const otp = generateOtp();

  
  await Otp.deleteMany({ email });


  await Otp.create({
    email,
    otp,
    expiresAt: Date.now() + 120 * 1000,
    signupData
  });

  await sendOtpMail(email, otp);
};
