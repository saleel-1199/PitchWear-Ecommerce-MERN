import bcrypt from "bcrypt";
import { Admin } from "../../Models/admin.model.js";
import { STATUS_CODES } from "../../Utils/statusCodes.js";


export const renderAdminLogin = (req, res) => {
  return res.render("admin/AdminLogin", {
    title: "Admin Login",
    error: null,
  });
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.render("admin/AdminLogin", {
        title: "Admin Login",
        error: "Admin not found"
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.render("admin/AdminLogin", {
        title: "Admin Login",
        error: "Invalid credentials"
      });
    }

    // ✅ session
    req.session.adminId = admin._id;
    req.session.adminEmail = admin.email;

    return res.redirect("/admin/Dashboard");

  } catch (err) {
    console.log("Admin Login Error:", err);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send("Server Error");
  }
};

export const adminLogout = (req, res) => {
  req.session.adminId = null;
  req.session.adminEmail = null;

  return res.redirect("/admin/login");
};


