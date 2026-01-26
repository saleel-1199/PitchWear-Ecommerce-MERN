import * as authService from "../Services/auth.service.js";

export const renderSignup = (req, res) => {
  res.render("Signup",{
    message:null,
    formData : {}
  });
};

export const signup = async (req, res) => {
  try {
    const {email} =  req.body;

    await authService.signupUser(req.body);
    
    req.session.email = email;
    res.render("VerifyOtp",{  
      email:req.body.email,
      message:null
    })
  } catch (error) {
    res.render("Signup",{
      message : error.message,
      formData : req.body
    })
  }
};


export const verifyOtp = async (req, res) => {
  try {

     const otp = req.body.otp.join("");
     
      const  email  = req.session.email;
      
    await authService.verifyOtp(email,otp);
     
    req.session.successMessage =  "Signup successful Please login now"
    res.redirect("/login");

  } catch (err) {
    res.render("verifyOtp",{
      message:null
    })
  }
};

export const resendSignupOtp = async(req,res) =>{

  try {
    const email = req.session.email;
    if(!email){
      return  res.render("Login",{
        message:"Session expired.Please login again",
        successMessage:null
      })
    }
    
    await authService.resendSignupOtp(email);
    return res.render("VerifyOtp",{
      message:null
    })
  } catch (error) {
    return res.render("VerifyOtp", {
      message:null
    });
  }
}


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
    req.session.userId =  user._id;

    res.redirect("/Home");
  } catch (error) {
      console.log("LOGIN ERROR:", error.message);
    res.render("Login",{
      message:error.message,
      successMessage:null
    })
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
      return res.status(500).send("Logout failed");
    }

    res.clearCookie("connect.sid"); 
    res.redirect("/login");
  });
};


// Home
export const renderHome = (req, res) => {
  res.render("Home");
};
