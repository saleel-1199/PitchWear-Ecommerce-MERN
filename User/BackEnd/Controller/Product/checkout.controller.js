import {
  getCheckoutDataService,
  placeOrderService,
} from "../../Services/Product/checkout.service.js";


import {
  getOrderSuccessDataService,
} from "../../Services/Product/checkout.service.js";

export const getCheckoutPageController = async (req, res) => {
    console.log(req.session);
    try {
    if (!req.session.userId) return res.redirect("/login");

    const data = await getCheckoutDataService(req.session.userId);

    res.render("products/Checkout", {
      ...data,
      cartCount: data.cart.items.length,
    });

  } catch (error) {
    console.log("Checkout Error:", error.message);
    res.redirect("/cart");
  }
};


export const placeOrderController = async (req, res) => {
  try {
   if (!req.session.userId) return res.redirect("/login");

    const order = await placeOrderService({
      userId: req.session.userId,
      addressId: req.body.addressId,
    });

    res.redirect(`/order-success/${order._id}`);

  } catch (error) {
    console.log("Place Order Error:", error.message);
    res.redirect("/checkout");
  }
};

export const orderSuccessController = async (req, res) => {
  try {

    if (!req.session.userId) {
      return res.redirect("/login");
    }

    const { id } = req.params;

    const order = await getOrderSuccessDataService(
      id,
      req.session.userId
    );

    res.render("products/OrderSuccess", {
      order,
      cartCount: 0, 
    });

  } catch (error) {
    console.log("Order Success Error:", error.message);
    res.redirect("/shop");
  }
};