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
  addTeam
} from "../../Controller/Admin/admin.team.controller.js";


import { adminAuth } from "../../Middlewares/Admin/adminauth.middleware.js";

import uploadProducts from "../../Middlewares/uploadProducts.js";

const router = express.Router();


router.get("/admin/products",adminAuth,productsPage);


router.get("/admin/products/add",adminAuth,addProductPage);
router.post("/admin/products/add",adminAuth,uploadProducts.array("images", 10),addProduct);


router.get("/admin/products/:id/edit",adminAuth, editProductPage);
router.patch("/admin/products/:id",adminAuth,uploadProducts.array("images", 10),editProduct);

router.get("/admin/products/:id/inventory", adminAuth,inventoryPage);
router.post("/admin/products/:id/inventory",adminAuth, saveInventory);


router.delete("/admin/products/:id", adminAuth,deleteProduct);

router.get("/admin/teams",adminAuth,teamsPage);
router.post("/admin/teams/add",adminAuth,addTeam);





export default router;
