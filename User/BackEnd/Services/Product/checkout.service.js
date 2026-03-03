import { Cart } from "../../Models/cart.model.js";
import  Address  from "../../Models/address.model.js"
import { Order } from "../../Models/order.model.js";
import { Product } from "../../Models/product.model.js";
import { generateOrderId } from "../../Utils/generateOrderId.js";


export const getCheckoutDataService = async (userId) => {
  console.log(userId)
  const cart = await Cart.findOne({ user: userId })
    .populate({
      path: "items.product",
      populate: { path: "team", select: "name logo" }
    })
    .lean();

  if (!cart || !cart.items.length)
    throw new Error("Cart empty");

  const addresses = await Address.find({ user_id : userId }).lean();

  const items = cart.items.map(item => ({
    ...item,
    subtotal: item.price * item.quantity,
  }));

  const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);

  const tax = 7.5;
  const deliveryFee = 5;
  const discount = 10;

  const finalTotal = subtotal + tax + deliveryFee - discount;

  return {
    cart: {
      ...cart,
      items,
      subtotal,
      tax,
      deliveryFee,
      discount,
      finalTotal,
    },
    addresses,
  };
};



export const placeOrderService = async ({ userId, addressId }) => {

  const cart = await Cart.findOne({ user: userId });
  if (!cart || !cart.items.length)
    throw new Error("Cart empty");

  const address = await Address.findById(addressId).lean();
  if (!address) throw new Error("Invalid address");

  for (const item of cart.items) {
    const product = await Product.findById(item.product);

    const variant = product.variants.find(v => v.size === item.size);

    if (!variant || variant.stock < item.quantity)
      throw new Error(`Stock issue for ${product.name}`);

    variant.stock -= item.quantity;
    await product.save();
  }

  const subtotal = cart.items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  const tax = 7.5;
  const deliveryFee = 5;
  const discount = 10;

  const finalTotal = subtotal + tax + deliveryFee - discount;

  let orderId;
  let exists = true;

  while (exists) {
    orderId = generateOrderId();
    exists = await Order.findOne({ orderId });
  }

  const order = await Order.create({
    orderId,   
    user: userId,
    items: cart.items,
    subtotal,
    tax,
    deliveryFee,
    discount,
    finalTotal,
    paymentMethod: "COD",

    addressSnapshot: {
      fullName: address.full_name,
      city: address.city,
      state: address.state,
      pincode: address.pin_code,
      addressLine: address.addressLine,
    }
  });

  cart.items = [];
  await cart.save();

  return order;
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