import { Order } from "../../Models/order.model.js";
import { Product } from "../../Models/product.model.js";
import { creditWallet } from "./wallet.service.js"
import { Offer } from "../../Models/offer.model.js";
import { Wallet } from "../../Models/wallet.model.js";
import mongoose from "mongoose";

export const getUserOrdersService = async (userId, search = "") => {

  const query = { user: userId };

  if (search) {
    query.orderId = { $regex: search, $options: "i" };
  }

  const orders = await Order.find(query)
  .populate("items.product")   
  .sort({ createdAt: -1 });

  return orders;
};

export const getOrderDetailService = async (orderId, userId) => {

  let order;

if (mongoose.Types.ObjectId.isValid(orderId)) {
  order = await Order.findOne({
    _id: orderId,
    user: userId
  }).populate("items.product");
} else {
  order = await Order.findOne({
    orderId: orderId,
    user: userId
  }).populate("items.product");
}

if (!order) throw new Error("Order not found");

  return order;
};


export const cancelOrderService = async (orderId, userId, itemId) => {
   
  console.log("ORDER ID:", orderId);
  console.log("USER ID:", userId);

 let order;

if (mongoose.Types.ObjectId.isValid(orderId)) {
  order = await Order.findOne({
    _id: orderId,
    user: userId
  });
} else {
  order = await Order.findOne({
    orderId: orderId,
    user: userId
  });
}

if (!order) throw new Error("Order not found");

  const item = order.items.id(itemId);
  if (!item) throw new Error("Item not found");

  if (item.status === "Cancelled")
    throw new Error("Already cancelled");

  const product = await Product.findById(item.product);
  const variant = product.variants.find(v => v.size === item.size);

  if (variant) {
    variant.stock += item.quantity;
    await product.save();
  }

  item.status = "Cancelled";

  const allStatuses = order.items.map(i => i.status);

  if (allStatuses.every(s => s === "Cancelled")) {
    order.status = "Cancelled";
  } 
  else if (allStatuses.some(s => s === "Pending")) {
    order.status = "Pending";
  } 
  else {
    order.status = "Partially Completed";
  }

 
  if (["Razorpay", "Wallet"].includes(order.paymentMethod)) {

    if (order.paymentStatus !== "Paid") {
      await order.save();
      return order;
    }

    let refundAmount;

    if (order.items.length === 1) {
      refundAmount = order.finalTotal; 
    } else {
      const totalItemsPrice = order.items.reduce(
        (sum, i) => sum + (i.price * i.quantity),
        0
      );

      const itemTotal = item.price * item.quantity;
      const ratio = itemTotal / totalItemsPrice;

      refundAmount = Math.round(order.finalTotal * ratio);
    }

    refundAmount = Math.max(refundAmount, 0);

   
    let wallet = await Wallet.findOne({ user: order.user });

    if (!wallet) {
      wallet = await Wallet.create({
        user: order.user,
        balance: 0,
        transactions: []
      });
    }

    const alreadyRefunded = wallet.transactions.some(
      t =>
        t.orderId === order.orderId &&
        t.type === "credit"
    );

    if (!alreadyRefunded && refundAmount > 0) {
      await creditWallet(
        order.user,
        refundAmount,
        order.orderId,
        "Order Cancel Refund"
      );
    }
  }

  await order.save();

  return order;
};

export const returnOrderService = async (orderId, userId, itemId, reason) => {

  if (!reason) throw new Error("Return reason required");



  let order;

if (mongoose.Types.ObjectId.isValid(orderId)) {
  order = await Order.findOne({
    _id: orderId,
    user: userId
  });
} else {
  order = await Order.findOne({
    orderId: orderId,
    user: userId
  });
}

if (!order) throw new Error("Order not found");



  const item = order.items.id(itemId);
  if (!item) throw new Error("Item not found");

  if (item.status !== "Delivered")
    throw new Error("Only delivered items can be returned");
  item.status = "Return Requested";
  item.returnReason = reason;

  await order.save();
  return order;
};

export const generateInvoiceService = async (orderId, userId) => {

  let order;

  if (mongoose.Types.ObjectId.isValid(orderId)) {
    order = await Order.findOne({
      _id: orderId,
      user: userId
    }).populate("items.product");
  } else {
    order = await Order.findOne({
      orderId: orderId,
      user: userId
    }).populate("items.product");
  }

  if (!order) return null;

  return order;
};

export const getBestOffer = async(product)=>{

 const now = new Date()

 const productOffer = await Offer.findOne({
  product:product._id,
  type:"Product",
  isActive:true,
  expiryDate:{ $gte: now }
 })

 const teamOffer = await Offer.findOne({
  team:product.team,
  type:"Team",
  isActive:true,
  expiryDate:{ $gte: now }
 })

 let discount = 0

 if(productOffer)
  discount = productOffer.discountPercent

 if(teamOffer)
  discount = Math.max(discount,teamOffer.discountPercent)

 return discount
}