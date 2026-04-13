import {
  getCheckoutDataService,
  placeOrderService,
  getOrderSuccessDataService,
  applyCouponCheckoutService,
  verifyPaymentService,
  handlePaymentFailureService,
  retryPaymentService
} from "../../Services/Product/checkout.service.js";

import Razorpay from "razorpay";


export const getCheckoutPageController = async (req, res) => {
  console.log(req.session);

  try {

    if (!req.session.userId) return res.redirect("/login");
    
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");


    const data = await getCheckoutDataService(
      req.session.userId,
      req.session.coupon   
    );

    res.render("products/Checkout", {
      ...data,
      cartCount: data.cart.items.length,
      addresses: data.addresses,
      appliedCoupon: req.session.coupon || null
    });

  } catch (error) { 

    console.log("Checkout Error:", error.message);


   req.session.errorMessage = error.message;

   if (req.xhr || req.headers.accept.includes("json")) {
    return res.json({
      success: false,
      redirect: "/cart"   
    });
  }

    res.redirect("/cart");

  }
};




export const applyCouponController = async (req,res)=>{

  try{

    const { code, subtotal } = req.body;

    const coupon = await applyCouponCheckoutService(
      code,
      subtotal
    );

    req.session.coupon = coupon;   

    res.json({
      success:true,
      discount:coupon.discount
    });

  }catch(error){

    res.json({
      success:false,
      message:error.message
    });

  }

};



export const removeCouponController = async(req,res)=>{

  try{

    req.session.coupon = null;

    res.json({success:true});

  }catch(error){

    res.json({success:false});

  }

};




export const placeOrderController = async (req, res) => {

  try {

   if (!req.session.userId) return res.redirect("/login");

    const result = await placeOrderService({

      userId: req.session.userId,
      addressId: req.body.addressId,

      paymentMethod: req.body.selectedPaymentMethod,  
      coupon: req.session.coupon            

    });


    if (result && result.walletError) {
  return res.json({
    success: false,
    message: result.walletError

  });
}

 
  req.session.coupon = null;

  
    if(req.body.selectedPaymentMethod === "Razorpay"){

      return res.json({

        razorpay:true,
        order:result.order,
        razorpayOrder:result.razorpayOrder,
        key:process.env.RAZORPAY_KEY

      });

    }

  

   if (req.body.selectedPaymentMethod === "Wallet") {
  return res.json({
    success: true,
    orderId: result.order._id
  });
  }

return res.json({
  success: true,
  orderId: result.order._id
});
  } catch (error) {

    res.json({
  success: false,
  message: error.message,
  redirect: "/cart" 
});
  }
};




export const verifyPaymentController = async (req, res) => {
  try {

    const { orderId, paymentId } = req.body;

    await verifyPaymentService(orderId, paymentId);

    res.json({ success: true });

  } catch (error) {
    console.log("VERIFY ERROR:", error.message);
    res.json({ success: false });
  }
};

export const paymentFailedController = async (req, res) => {
  try {

    const { orderId } = req.body;

    await handlePaymentFailureService(orderId);

    res.json({ success: true });

  } catch (err) {
    console.log(err.message);
    res.json({ success: false });
  }
};

export const orderSuccessController = async (req, res) => {

  try {

    if (!req.session.userId) {
      return res.redirect("/login");
    }
     
    res.set("Cache-Control", "no-store");


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

    res.redirect(
      `/shop?error=${encodeURIComponent(error.message)}`
    );

  }
};

export const retryPaymentController = async (req, res) => {
  try {

    if (!req.session.userId) {
      return res.json({ success: false });
    }

    const { orderId } = req.params;

    const result = await retryPaymentService(
      orderId,
      req.session.userId
    );

    res.json({
      success: true,
      razorpayOrder: result.razorpayOrder,
      key: process.env.RAZORPAY_KEY,
      orderId: result.order._id
    });

  } catch (err) {
    console.log(err.message);

    res.json({
      success: false,
      message: err.message
    });
  }
};