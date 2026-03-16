import express from "express";
import {
  productsPage,
  addProductPage,
  addProduct,
  editProductPage,
  editProduct,
  inventoryPage,
  saveInventory,
  deleteProduct,
} from "../../Controller/Admin/admin.product.controller.js";

import {
  teamsPage,
  addTeam,
  editTeamPage,
  updateTeamName,
  deleteTeam,
  
} from "../../Controller/Admin/admin.team.controller.js";

import {
  adminOrdersPage,
  adminOrderDetailPage,
  updateOrderStatusController,
  updateItemStatusController,
  approveReturnController
} from "../../Controller/Admin/admin.order.controller.js";

import {
 downloadExcelReportController,
 downloadPDFReportController
} from "../../Controller/Admin/admin.report.controller.js";

import { 
  offersPage,
 createOfferController,
 deleteOfferController
} from "../../Controller/Admin/admin.offer.controller.js"

import {
 couponsPage,
 createCouponController,
 deleteCouponController
} from "../../Controller/Admin/admin.coupon.controller.js";

import {
 salesReportPage
} from "../../Controller/Admin/admin.report.controller.js";

import { adminAuth } from "../../Middlewares/Admin/adminauth.middleware.js";

import uploadProducts from "../../Middlewares/uploadProducts.js";

const router = express.Router();


router.get("/admin/products",adminAuth,productsPage);


router.get("/admin/products/add",adminAuth,addProductPage);
router.post("/admin/products/add",adminAuth,uploadProducts.array("images", 10),addProduct);


router.get("/admin/products/:id/edit",adminAuth,editProductPage);
router.patch("/admin/products/:id",adminAuth,uploadProducts.array("images", 10),editProduct);

router.get("/admin/products/:id/inventory", adminAuth,inventoryPage);
router.post("/admin/products/:id/inventory",adminAuth, saveInventory);


router.delete("/admin/products/:id",adminAuth,deleteProduct);

router.get("/admin/teams",adminAuth,teamsPage);
router.post("/admin/teams/add",adminAuth,addTeam);

router.get("/admin/teams/:id/edit",adminAuth,editTeamPage);
router.post("/admin/teams/:id/edit",adminAuth,updateTeamName)

router.delete("/admin/teams/:id",adminAuth,deleteTeam)


router.get("/admin/orders",adminOrdersPage);
router.get("/admin/orders/:id",adminOrderDetailPage);
router.patch("/admin/orders/:id/status",updateOrderStatusController);
router.patch("/admin/orders/:orderId/item/:itemId/status",updateItemStatusController);

router.patch("/admin/orders/:orderId/item/:itemId/approve-return",approveReturnController);

router.get("/admin/offers",offersPage)
router.post("/admin/offers",createOfferController)
router.delete("/admin/offers/:id",deleteOfferController)


router.get("/admin/coupons",couponsPage);
router.post("/admin/coupons",createCouponController);
router.delete("/admin/coupons/:id",deleteCouponController);

router.get("/admin/sales-report",salesReportPage);
router.get("/sales-report/excel", downloadExcelReportController);
router.get("/sales-report/pdf", downloadPDFReportController);




export default router;
