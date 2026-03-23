import { Cart } from "../../Models/cart.model.js";
import  Address  from "../../Models/address.model.js"
import { Order } from "../../Models/order.model.js";
import { Product } from "../../Models/product.model.js";
import { generateOrderId } from "../../Utils/generateOrderId.js";
import Razorpay from "razorpay";
import { Coupon } from "../../Models/coupon.model.js";
import { debitWallet } from "./wallet.service.js";
import { Wallet } from "../../Models/wallet.model.js"
import { getBestOffer } from "./order.service.js"


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET
});

export const getCheckoutDataService = async (userId, sessionCoupon) => {

 const cart = await Cart.findOne({ user: userId })
  .populate("items.product")
  .lean();

 if (!cart || !cart.items.length)
  throw new Error("Cart empty");

 const addresses = await Address.find({ user_id: userId }).lean();


 const items = await Promise.all(
  cart.items.map(async (item) => {

    const product = await Product.findById(item.product);

    const discountPercent = await getBestOffer(product);

    const originalPrice = item.price;

    const finalPrice =
      originalPrice - (originalPrice * discountPercent) / 100;

    return {
      ...item,
      originalPrice,
      price: finalPrice,
      discountPercent,
      subtotal: finalPrice * item.quantity
    };

  })
);

let subtotal = items.reduce(
 (sum, i) => sum + i.subtotal,
 0
);


 const tax = 7.5;
 const deliveryFee = 5;

 let discount = 0;

 if(sessionCoupon){
   discount = sessionCoupon.discount;
 }



 const finalTotal =
  subtotal + tax + deliveryFee - discount;
  
  const coupons = await Coupon.find({
  isActive: true,
  expiryDate: { $gt: new Date() },
  minPurchase: { $lte: subtotal }
}).lean();



 return {
  cart:{
   ...cart,
   items,
   subtotal,
   tax,
   deliveryFee,
   discount,
   finalTotal
  },
  addresses,
  coupons
 };

};



export const placeOrderService = async ({
 userId,
 addressId,
 paymentMethod,
 coupon
}) => {

 const cart = await Cart.findOne({ user: userId });

 if (!cart || !cart.items.length)
  throw new Error("Cart empty");

 const address = await Address.findById(addressId).lean();

 if (!address) throw new Error("Invalid address");

 //STOCK

 for (const item of cart.items) {

  const product = await Product.findById(item.product);

  const variant =
  product.variants.find(v=>v.size===item.size);

  if(!variant || variant.stock < item.quantity)
   throw new Error(`Stock issue`);

 }

 // PRICE 

 const items = await Promise.all(
 cart.items.map(async (item) => {

   const product = await Product.findById(item.product);

   const discountPercent = await getBestOffer(product);

   const originalPrice = item.price;

   const finalPrice =
     originalPrice - (originalPrice * discountPercent) / 100;

   return {
     ...item.toObject(),
     price: finalPrice,
     subtotal: finalPrice * item.quantity
   };
 })
);

const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);

 const tax = 7.5;
 const deliveryFee = 5;

 let discount = 0;

 if(coupon){
   discount = coupon.discount;
 }

 const finalTotal =
 subtotal + tax + deliveryFee - discount;


 if(paymentMethod === "Wallet"){

 const wallet = await Wallet.findOne({user:userId})

 if(!wallet || wallet.balance < finalTotal)
  throw new Error("Insufficient wallet balance")

}

 /* GENERATE ORDER ID */

 let orderId;
 let exists=true;

 while(exists){

 orderId = generateOrderId();
 exists = await Order.findOne({orderId});

 }

 /* CREATE ORDER */

 const order = await Order.create({

 orderId,
 user:userId,
 items:items,
 subtotal,
 tax,
 deliveryFee,
 discount,
 finalTotal,

 paymentMethod,

 couponCode: coupon?.code,

 addressSnapshot:{
 fullName:address.full_name,
 city:address.city,
 phone:address.phone_no,
 state:address.state,
 pincode:address.pin_code,
 addressLine:address.address_line1
 }

 });

 if(paymentMethod === "Wallet"){

 await debitWallet(userId,finalTotal,orderId)

}


 /* RAZORPAY ORDER */

 if(paymentMethod==="Razorpay"){

 const razorpayOrder =
 await razorpay.orders.create({

  amount: finalTotal*100,
  currency:"INR",
  receipt: orderId

 });

 order.razorpayOrderId =
 razorpayOrder.id;

 await order.save();

 return {
  order,
  razorpayOrder
 };

 }

 
 

 /* COD */

 for(const item of cart.items){

 const product = await Product.findById(item.product);

 const variant =
 product.variants.find(v=>v.size===item.size);

 variant.stock -= item.quantity;

 await product.save();

 }


 cart.items=[];
 await cart.save();

 return {order};

};



export const getOrderSuccessDataService = async (orderId, userId) => {

  const order = await Order.findOne({
    _id: orderId,
    user: userId, 
  })
    .populate("items.product");

  if (!order) {
    throw new Error("Order not found");
  }

  return order;
};


export const applyCouponCheckoutService = async(code,subtotal)=>{

 const coupon = await Coupon.findOne({
  code: new RegExp("^" + code + "$", "i"),
  isActive: true
});

 if(!coupon) throw new Error("Invalid coupon");

 if(coupon.expiryDate < new Date())
  throw new Error("Coupon expired");

 if(subtotal < coupon.minPurchase)
  throw new Error("Minimum purchase not met");

 const discount =
 (subtotal * coupon.discountPercent)/100;

 return {
  code: coupon.code,
  discount
 };

};