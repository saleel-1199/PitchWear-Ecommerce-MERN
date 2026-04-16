export const loggedIn = (req, res, next) => {
  if (req.session.userId) {
    if (req.method === "POST") {
      return next();
    }

    return res.redirect("/Home");
  }

  next();
};