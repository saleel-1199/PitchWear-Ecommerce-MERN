export const googleCallbackController = (req, res) => {
  try {
    
    if (req.user.isBlocked) {
      return res.render("Login", {
        message: "Your account is blocked. Please contact support.",
        successMessage:null
      });
    }

    req.session.userId = req.user._id;

    return res.redirect("/Home");
  } catch (err) {
    console.log("Google Callback Error:", err);
    return res.redirect("/login");
  }
};