export const loggedIn = (req, res, next) => {

  const isAdminRoute = req.originalUrl.startsWith("/admin");

  if (req.session.adminId && isAdminRoute) {
    return res.redirect("/admin/dashboard");
  }

  if (req.session.userId && !isAdminRoute) {
    if (req.method === "POST") return next();
    return res.redirect("/Home");
  }

  next();
};