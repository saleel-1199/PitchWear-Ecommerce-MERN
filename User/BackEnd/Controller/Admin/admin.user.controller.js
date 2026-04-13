import { User } from "../../Models/user.model.js";

import {
  fetchUsersService,
  toggleBlockUserService,
} from "../../Services/Admin/admin.user.services.js";

export const renderUserManagement = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search || "";
    const status = req.query.status || "";
    const sort = req.query.sort || "latest";

    const result = await fetchUsersService({
      page,
      limit: 5,
      search,
      status,
      sort,
    });

    
    const { users, totalPages } = result;

    return res.render("Admin/UserManagement", {
      title: "User Management",
      active: "users",
      users,
      page,
      totalPages,
      search,
      status,
      sort,
    });
  } catch (err) {
    console.log("renderUserManagement error:", err);
    return res.status(500).send("Server Error");
  }
};

export const toggleBlockUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await toggleBlockUserService(id);
    if (!user) return res.status(404).send("User not found");

    return res.redirect("/admin/users");
  } catch (err) {
    console.log("toggleBlockUser error:", err);
    return res.status(500).send("Server Error");
  }
};

export const renderConfirmBlockPage = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).lean();
    if (!user) return res.status(404).send("User not found");

    return res.render("Admin/ConfirmBlock", {
      title: "Confirm Action",
      user,
      active: "users"
    });
  } catch (err) {
    return res.status(500).send("Server Error");
  }
};




