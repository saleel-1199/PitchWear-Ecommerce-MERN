export const loggedIn = (req, res, next) => {
  if (req.session.userId) {
    return res.redirect("/Home");
  }
  next();
};