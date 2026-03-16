import {
  getCheckoutDataService,
  placeOrderService,
  getOrderSuccessDataService,
  applyCouponCheckoutService
} from "../../Services/Product/checkout.service.js";




export const getCheckoutPageController = async (req, res) => {
  console.log(req.session);

  try {

    if (!req.session.userId) return res.redirect("/login");

    const data = await getCheckoutDataService(
      req.session.userId,
      req.session.coupon   
    );

    res.render("products/Checkout", {
      ...data,
      cartCount: data.cart.items.length,
      addresses: data.addresses,
      coupon: req.session.coupon || null  
    });

  } catch (error) {

    console.log("Checkout Error:", error.message);
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

 

    if(req.body.selectedPaymentMethod === "Razorpay"){

      return res.json({

        razorpay:true,
        order:result.order,
        razorpayOrder:result.razorpayOrder,
        key:process.env.RAZORPAY_KEY

      });

    }

  

    req.session.coupon = null;

    res.redirect(`/order-success/${result.order._id}`);

  } catch (error) {

    console.log("Place Order Error:", error.message);
    res.redirect("/checkout");

  }
};




export const verifyPaymentController = async(req,res)=>{

  try{

    const { orderId, paymentId } = req.body;

    await Order.findOneAndUpdate(

      { razorpayOrderId:orderId },

      {
        paymentStatus:"Paid",
        razorpayPaymentId:paymentId
      }

    );

    req.session.coupon = null;

    res.json({success:true});

  }catch(error){

    res.json({success:false});

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

    res.redirect(
      `/shop?error=${encodeURIComponent(error.message)}`
    );

  }
};