import express from "express";
import { shopPageController } from "../../Controller/Product/shop.controller.js";
import { getProductDetailsController } from "../../Controller/Product/product.controller.js";
import { isAuth } from "../../Middlewares/auth.middleware.js";

const router = express.Router();


router.get("/shop",isAuth, shopPageController);

router.get("/product/:id",isAuth, getProductDetailsController);

export default router;
