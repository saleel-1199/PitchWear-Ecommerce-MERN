import express from "express";
import * as adminAuthController from "../../Controller/Admin/admin.auth.controller.js";
import *as adminUserController from "../../Controller/Admin/admin.user.controller.js"

import { adminAuth } from "../../Middlewares/Admin/adminauth.middleware.js";

const router = express.Router();


router.route("/admin/login")
  .get(adminAuthController.renderAdminLogin)
  .post(adminAuthController.adminLogin);

router.get("/admin/logout", adminAuthController.adminLogout);


router.get("/admin/dashboard",adminAuth,adminAuthController.renderDashboard)

router.post("/admin/users/:id/toggle-block",adminAuth,adminUserController.toggleBlockUser);

router.get("/admin/users/:id/confirm-block",adminAuth,adminUserController.renderConfirmBlockPage);

router.get("/admin/users",adminAuth,adminUserController.renderUserManagement)
export default router;