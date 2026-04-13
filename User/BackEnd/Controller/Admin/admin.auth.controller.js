export const renderAdminLogin = (req, res) => {
  return res.render("admin/AdminLogin", {
    title: "Admin Login",
    error: null,
  });
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      
      req.session.adminId = "superadmin";
      req.session.adminEmail = email;

      return res.redirect("/admin/Dashboard");
    }

    return res.render("admin/AdminLogin", {
      title: "Admin Login",
      error: "Invalid admin email or password"
    });
  } catch (err) {
    console.log("Admin Login Error:", err);
    return res.status(500).send("Server Error");
  }
};

export const adminLogout = (req, res) => {
  req.session.adminId = null;
  req.session.adminEmail = null;

  return res.redirect("/admin/login");
};


