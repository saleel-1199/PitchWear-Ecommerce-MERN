import * as userService from "../Services/user.services.js";


export const renderUserProfile = async (req, res) => {
  try {
    const user = await userService.getUserById(req.session.userId);
    console.log(user)
    res.render("UserProfile", {
      user
    });
  } catch (error) {
    res.status(500).send("Something went wrong");
  }
};


export const updateProfile = async (req, res) => {
  try {
    await userService.updateUserProfile(
      req.session.userId,
      req.body
    );

    res.redirect("/profile");
  } catch (error) {
    res.render("EditProfile", {
      user: res.locals.user,
      error: error.message
    });
  }
};

export const renderEditProfile = (req, res) => {
  res.render("EditProfile", {
    user: res.locals.user,
    error: null
  });
};


export const renderChangeEmail = (req, res) => {
  res.render("ChangeEmail", { error: null });
};


export const sendEmailOtp = async (req, res) => {
  try {
    await userService.sendEmailChangeOtp(
      req.session.userId,
      req.body.email
    );
    res.redirect("/profile/verify-email-otp");
  } catch (error) {
    res.render("ChangeEmail", { error: error.message });
  }
};

export const renderVerifyEmailOtp = async(req,res) =>{
    res.render("VerifyEmailOtp",{
        error:null,

    })
}

export const verifyEmailOtp = async (req, res) => {
  try {
    const otp = req.body.otp.join("");
    await userService.verifyEmailChangeOtp(
      req.session.userId,
      otp
    );
    res.redirect("/profile");
  } catch (error) {
    res.render("VerifyEmailOtp", { error: error.message });
  }
};



export const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      throw new Error("Please upload an image");
    }

    const imagePath = `/uploads/profile/${req.file.filename}`;

    await userService.updateProfileImage(
      req.session.userId,
      imagePath
    );

    res.redirect("/profile/edit");
  } catch (error) {
    res.render("EditProfile", {
      user: res.locals.user,
      error: error.message
    });
  }
};


