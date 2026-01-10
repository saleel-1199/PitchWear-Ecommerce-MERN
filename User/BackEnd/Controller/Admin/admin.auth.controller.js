export const renderAdminLogin = (req, res) => {
  return res.render("Admin/AdminLogin", {
    title: "Admin Login",
    error: null,
  });
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ check admin from .env
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      // ✅ store session
      req.session.adminId = "superadmin";
      req.session.adminEmail = email;

      return res.redirect("/admin/dashboard");
    }

    return res.render("Admin/AdminLogin", {
      title: "Admin Login",
      error: "Invalid admin email or password",
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


export const renderDashboard = async (req, res) => {
  try {
   
    const stats = {
      totalUsers: 0,
      totalOrders: 0,
      totalProducts: 0,
      revenue: 0,
    };

    return res.render("Admin/AdminDashboard", {
      title: "Admin Dashboard",
      stats,
      active: "dashboard"
    });
  } catch (err) {
    console.log("Dashboard Render Error:", err);
    return res.status(500).send("Server Error");
  }
};
