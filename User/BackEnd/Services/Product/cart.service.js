import { Cart } from "../../Models/cart.model.js";
import { Product } from "../../Models/product.model.js";
import { Wishlist } from "../../Models/wishlist.model.js";
import { getBestOffer } from "./order.service.js"

const MAX_QTY = 5;


export const getUserCartService = async (userId) => {
  let cart = await Cart.findOne({ user: userId })
    .populate({
      path: "items.product",
      populate: {
        path: "team",
        select: "name logo",
      },
    });

  if (!cart) return { items: [] };
  const validItems = cart.items.filter(item => item.product);

  if (validItems.length !== cart.items.length) {
    cart.items = validItems;
    await cart.save();
  }
  const leanCart = cart.toObject();
 leanCart.items = await Promise.all(
 leanCart.items.map(async(item)=>{

  const originalPrice = item.price;

 const discountPercent = await getBestOffer(item.product)

 const finalPrice =
 item.price - (item.price * discountPercent)/100

 return {
  ...item,
  originalPrice,
  discountPercent,
  price:finalPrice,
  subtotal: finalPrice * item.quantity
 }

})
)
  leanCart.subtotal = leanCart.items.reduce(
    (sum, i) => sum + i.subtotal,
    0
  );

  leanCart.deliveryFee = 5;
  leanCart.tax = 5;
  leanCart.discount = 0;

  leanCart.finalTotal =
    leanCart.subtotal +
    leanCart.deliveryFee +
    leanCart.tax -
    leanCart.discount;

  return leanCart;
};

export const addToCartService = async ({
  userId,
  productId,
  size,
  quantity,
}) => {

  const qty = Number(quantity) || 1;
  const cleanSize = size?.trim();

  if (!cleanSize) throw new Error("Size not selected");

  const product = await Product.findOne({
    _id: productId,
    isDeleted: false,
    status: "Active",
  });

  if (!product) throw new Error("Product unavailable");

  const variant = product.variants.find(
    v => v.size === cleanSize
  );

  if (!variant) throw new Error("Invalid variant");

  if (variant.stock <= 0)
    throw new Error("Variant out of stock");

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
  }

  const existingItem = cart.items.find(
    item =>
      String(item.product) === String(productId) &&
      item.size === cleanSize
  );

  if (existingItem) {

    const newQty = existingItem.quantity + qty;

    if (newQty > variant.stock)
      throw new Error("Stock limit reached");

    if (newQty > MAX_QTY)
      throw new Error("Maximum quantity limit reached");

    existingItem.quantity = newQty;

  } else {

    if (qty > variant.stock)
      throw new Error("Stock limit reached");

    if (qty > MAX_QTY)
      throw new Error("Maximum quantity limit reached");

    cart.items.push({
      product: productId,
      size: cleanSize,
      quantity: qty,
      price: variant.price, 
    });
  }

  console.log("🛒 Saving Cart:", cart.items);

  await cart.save();
  
  await Wishlist.updateOne(
  { user: userId },
  { $pull: { products: productId } }
  );

  console.log("✅ Cart Saved");
};

export const updateCartQuantityService = async ({
  userId,
  productId,
  size,
  action,
}) => {

  const cleanSize = size?.trim();

  const cart = await Cart.findOne({ user: userId });
  if (!cart) return;

  const item = cart.items.find(
    i =>
      String(i.product) === String(productId) &&
      i.size === cleanSize
  );

  if (!item) return;

  const product = await Product.findById(productId);
  const variant = product?.variants.find(
    v => v.size === cleanSize
  );

  if (!variant) throw new Error("Variant not found");

  if (action === "inc") {

    if (item.quantity >= variant.stock)
      throw new Error("Stock limit reached");

    if (item.quantity >= MAX_QTY)
      throw new Error("Maximum quantity reached");

    item.quantity += 1;
  }

  if (action === "dec") {

    item.quantity -= 1;

    if (item.quantity <= 0) {
      cart.items = cart.items.filter(i => i !== item);
    }
  }

  await cart.save();
};


export const removeCartItemService = async ({
  userId,
  productId,
  size,
}) => {

  const cleanSize = size?.trim();

  await Cart.updateOne(
    { user: userId },
    {
      $pull: {
        items: {
          product: productId,
          size: cleanSize,
        },
      },
    }
  );
};