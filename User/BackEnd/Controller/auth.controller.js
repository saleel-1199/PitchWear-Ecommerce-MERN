import * as authService from "../Services/auth.service.js";
import { logger } from "../Utils/logger.js";
import { Product } from "../../BackEnd/Models/product.model.js"; 
import { STATUS_CODES } from "../Utils/statusCodes.js";

export const renderSignup = (req, res) => {

  const referralCode = req.query.ref || "";

  res.render("Signup",{
    message:null,
    formData : {
      referralCode
    }
  });
};

export const signup = async (req, res) => {
  
  try {
    const {email} =  req.body;

    await authService.signupUser(req.body);
    
    req.session.email = email;


    return res.redirect("/VerifyOtp");
  } catch (error) {

    res.render("Signup",{
      message : error.message,
      formData : req.body
    })
  }
};


export const verifyOtp = async (req, res) => {
  try {
    
    if (!req.body.otp || !Array.isArray(req.body.otp)) {
      req.session.otpError = "Please enter complete OTP";
      return res.redirect("/VerifyOtp");
    }

    const otp = req.body.otp.join("");

    const email = req.session.email;

    await authService.verifyOtp(email, otp);

    req.session.successMessage =
      "Signup successful Please login now";

    res.redirect("/login");

  } catch (err) {
    req.session.otpError = err.message;
    return res.redirect("/VerifyOtp");
  }
};


export const resendSignupOtp = async (req, res) => {
  try {
    const email =req.body.email || req.session.email;

    if (!email) {
      req.session.otpError = "Session expired. Please login again";
      return res.redirect("/login");
    }

    await authService.resendSignupOtp(email);

    req.session.otpResent = true;

    return res.redirect("/VerifyOtp");
  } catch (error) {
    req.session.otpError = "Failed to resend OTP";
    return res.redirect("/VerifyOtp"); 
  }
};

export const renderVerifyOtp = (req, res) => {

  const error = req.session.otpError || null;
  const otpResent = req.session.otpResent || false;

  req.session.otpError = null;
  req.session.otpResent = null;

  res.render("VerifyOtp", {
    error,
    otpResent,
    email:req.session.email
  });
};

export const renderLogin = (req, res) => {

  const successMessage = req.session.successMessage;
  req.session.successMessage = null;
   


  res.render("Login",{
    message:null,
    successMessage
  });
};




export const login = async (req, res) => {
  try {
    const user = await authService.loginUser(req.body);

    req.session.userId = user._id;

    const redirectTo = req.session.redirectTo;

    console.log("RedirectTo:", redirectTo);

    req.session.redirectTo = null;

    if (redirectTo) {
      return res.redirect(redirectTo); 
    }

    return res.redirect("/Home"); 

  } catch (error) {
    console.log("LOGIN ERROR:", error.message);

    return res.render("Login", {
      message: error.message,
      successMessage: null
    });
  }
};



//forgot

export const renderForgot = (req,res) =>{
  res.render("ForgotPassword",{
    error:null
  })
}


export const forgotPassword = async (req, res) => {
  try {
    await authService.sendForgotPasswordOtp(req.body.email, req.session);
    res.render("VerifyForgotOtp", {
      email: req.session.resetEmail,
      error:null
    });
  } catch (err) {
    res.render("ForgotPassword", {
      error: err.message
    });
  }
};


export const verifyForgotOtp = async (req, res) => {
  try {
    const otp = req.body.otp.join("");
    await authService.verifyForgotOtp(otp, req.session);
    res.render("ResetPassword",{
      error:null
    });
  } catch (err) {
    res.render("VerifyForgotOtp", {
      email: req.session.resetEmail,
      error: err.message
    });
  }
};





export const resetPassword = async (req, res) => {
  try {
    await authService.resetPassword(req.body, req.session);
    res.redirect("/login");
  } catch (err) {
    res.render("ResetPassword", {
      error: err.message
    });
  }
};

export const logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send("Logout failed");
    }

    res.clearCookie("connect.sid"); 
    res.redirect("/login");
  });
};


export const renderHome = async (req, res) => {
  try {
    const products = await Product.find().sort({createdAt:-1}).limit(8);


    res.render("Home", {
      products
    });

  } catch (err) {
    console.log(err);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send("Server Error");
  }
};