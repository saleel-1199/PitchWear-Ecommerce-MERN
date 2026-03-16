import { Order } from "../../Models/order.model.js";
import { Product } from "../../Models/product.model.js";
import { creditWallet } from "../Product/wallet.service.js"

export const getAdminOrdersService = async ({
  search = "",
  status = "",
  page = 1,
  limit = 8
}) => {

  const query = {};

  if (status) {
    query.status = status;
  }

  if (search) {

    const orConditions = [

      { orderId: { $regex: search, $options: "i" } },

    
      { "addressSnapshot.fullName": { $regex: search, $options: "i" } }

    ];

    const date = new Date(search);

    if (!isNaN(date.getTime())) {

      const start = new Date(date);
      start.setHours(0,0,0,0);

      const end = new Date(date);
      end.setHours(23,59,59,999);

      orConditions.push({
        createdAt: { $gte: start, $lte: end }
      });

    }

    query.$or = orConditions;
  }

  const skip = (page - 1) * limit;

  const orders = await Order.find(query)
    .populate("user")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalOrders = await Order.countDocuments(query);

  return {
    orders,
    currentPage: page,
    totalPages: Math.ceil(totalOrders / limit)
  };
};


export const getOrderDetailService = async (orderId) => {

  const order = await Order.findById(orderId)  
    .populate("user", "fullName email")
    .populate("items.product");

  if (!order) throw new Error("Order not found");

  return order;
};

export const updateOrderStatusService = async (orderId, status) => {

  const allowedStatuses = [
    "Pending",
    "Shipped",
    "Out for Delivery",
    "Delivered",
    "Cancelled",
  ];

  if (!allowedStatuses.includes(status)) {
    throw new Error("Invalid status");
  }

  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found");

  if (order.status === "Cancelled") {
    throw new Error("Cancelled order cannot be updated");
  }

  order.items.forEach(item => {
    if (item.status !== "Cancelled" && item.status !== "Returned") {
      item.status = status;
    }
  });

  const statuses = order.items.map(i => i.status);

  if (statuses.every(s => s === "Cancelled")) {
    order.status = "Cancelled";
  }
  else if (statuses.every(s => s === "Delivered")) {
    order.status = "Delivered";
  }
  else if (statuses.some(s => s === "Pending")) {
    order.status = "Pending";
  }
  else {
    order.status = "Partially Completed";
  }

  await order.save();
  return order;
};



export const updateItemStatusService = async (orderId, itemId, status) => {

  const allowedStatuses = [
    "Pending",
    "Shipped",
    "Out for Delivery",
    "Delivered",
    "Cancelled",
  ];

  if (!allowedStatuses.includes(status))
    throw new Error("Invalid status");

  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found");

  const item = order.items.id(itemId);
  if (!item) throw new Error("Item not found");


if (item.status === "Cancelled") {
  throw new Error("Item already cancelled");
}

  item.status = status;

  if (status === "Cancelled" && order.paymentMethod === "Razorpay") {

  const refundAmount = item.price * item.quantity;

  await creditWallet(
    order.user,
    refundAmount,
    order.orderId,
    "Order Cancel Refund"
  );

}


  const statuses = order.items.map(i => i.status);

  if (statuses.every(s => s === "Cancelled")) {
    order.status = "Cancelled";
  }
  else if (statuses.every(s => s === "Delivered")) {
    order.status = "Delivered";
  }
  else if (statuses.some(s => s === "Pending")) {
    order.status = "Pending";
  }
  else {
    order.status = "Partially Completed";
  }

  await order.save();
};


export const approveReturnService = async (orderId, itemId) => {

  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found");

  const item = order.items.id(itemId);
  if (!item) throw new Error("Item not found");

  if (item.status !== "Return Requested")
    throw new Error("Invalid return state");

 
  const product = await Product.findById(item.product);
  const variant = product.variants.find(v => v.size === item.size);

  if (variant) {
    variant.stock += item.quantity;
    await product.save();
  }

  item.status = "Returned";

  const statuses = order.items.map(i => i.status);

  if (statuses.every(s => s === "Cancelled")) {
    order.status = "Cancelled";
  }
  else if (statuses.every(s => s === "Returned")) {
    order.status = "Returned";
  }
  else if (statuses.every(s => s === "Delivered")) {
    order.status = "Delivered";
  }
  else {
    order.status = "Pending";
  }

  await order.save();

  const refundAmount = item.price * item.quantity;

 await creditWallet(
  order.user,
  refundAmount,
  order.orderId,
  "Return Refund"
 )

};