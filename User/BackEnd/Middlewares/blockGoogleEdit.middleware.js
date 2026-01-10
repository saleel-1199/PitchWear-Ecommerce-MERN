export const blockGoogleEdit = (req, res, next) => {
  if (req.user && req.user.authProvider === "google") {
    return res.redirect("/profile");
  }
  next();
};