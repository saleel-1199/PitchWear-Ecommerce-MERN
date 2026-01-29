import express from "express";
import { shopPageController } from "../../Controller/Product/shop.controller.js";
import { getProductDetailsController } from "../../Controller/Product/product.controller.js";

const router = express.Router();


router.get("/shop",shopPageController);

router.get("/product/:slug",getProductDetailsController);

export default router;
