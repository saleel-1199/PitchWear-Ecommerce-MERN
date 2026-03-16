import express from "express";
import { shopPageController } from "../../Controller/Product/shop.controller.js";
import { getProductDetailsController } from "../../Controller/Product/product.controller.js";

import {
  getCartPageController,
  addToCartController,
  updateCartQuantityController,
  removeCartItemController,
} from "../../Controller/Product/cart.controller.js";

import {
  getWishlistPageController,
  addToWishlistController,
  removeFromWishlistController,
} from "../../Controller/Product/wishlist.controller.js";


import {
  getCheckoutPageController,
  placeOrderController,
  orderSuccessController
} from "../../Controller/Product/checkout.controller.js";

import{
  getUserOrdersController,
  getOrderDetailController,
  cancelOrderController,
  returnOrderController,
  downloadInvoiceController
} from "../../Controller/Product/order.controller.js"

import {
  applyCouponController,
  removeCouponController,
  verifyPaymentController
} from "../../Controller/Product/checkout.controller.js";

import { walletPage } from "../../Controller/Product/wallet.controller.js";

const router = express.Router();

router.get("/shop",shopPageController);
router.get("/product/:slug",getProductDetailsController);


router.get("/cart", getCartPageController);
router.post("/cart", addToCartController);
router.patch("/cart/:productId", updateCartQuantityController);
router.delete("/cart/:productId", removeCartItemController);

router.get("/wishlist", getWishlistPageController);
router.post("/wishlist", addToWishlistController);
router.post("/wishlist/remove/:productId", removeFromWishlistController);

router.get("/checkout", getCheckoutPageController);
router.post("/checkout", placeOrderController);
router.get("/order-success/:id", orderSuccessController);
router.get("/order-success/:id", orderSuccessController);



router.post("/checkout/apply-coupon", applyCouponController);
router.post("/checkout/remove-coupon", removeCouponController);

router.post("/verify-payment", verifyPaymentController);



router.get("/orders", getUserOrdersController);
router.get("/orders/:orderId", getOrderDetailController);
router.post("/orders/:orderId/item/:itemId/cancel",cancelOrderController);
router.post("/orders/:orderId/item/:itemId/return",returnOrderController);
router.get("/orders/:orderId/invoice", downloadInvoiceController);

router.get("/wallet", walletPage);

export default router;
