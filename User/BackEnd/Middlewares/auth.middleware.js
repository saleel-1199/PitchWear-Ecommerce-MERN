import { User } from "../Models/user.model.js";

export const isAuth = async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.redirect("/login");
    }

    const user = await User.findById(req.session.userId);

    if (!user) {
      req.session.destroy(() => {});
      return res.redirect("/login");
    }

    if (user.isBlocked) {
      req.session.destroy(() => {});
      return res.render("Login", {
        message: "Your account has been blocked. Please contact support.",
        successMessage: null
      });
    }

    next();
  } catch (err) {
    return res.redirect("/login");
  }
};
