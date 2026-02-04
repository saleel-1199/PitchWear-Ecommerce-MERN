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
  deleteTeam
} from "../../Controller/Admin/admin.team.controller.js";


import { adminAuth } from "../../Middlewares/Admin/adminauth.middleware.js";

import uploadProducts from "../../Middlewares/uploadProducts.js";

const router = express.Router();


router.get("/admin/products", productsPage);


router.get("/admin/products/add",addProductPage);
router.post("/admin/products/add",uploadProducts.array("images", 10),addProduct);


router.get("/admin/products/:id/edit", editProductPage);
router.patch("/admin/products/:id",uploadProducts.array("images", 10),editProduct);

router.get("/admin/products/:id/inventory", inventoryPage);
router.post("/admin/products/:id/inventory", saveInventory);


router.delete("/admin/products/:id", deleteProduct);

router.get("/admin/teams", teamsPage);
router.post("/admin/teams/add", addTeam);





export default router;
