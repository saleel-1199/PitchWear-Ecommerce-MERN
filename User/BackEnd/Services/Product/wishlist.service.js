import { Wishlist } from "../../Models/wishlist.model.js";
import { Product } from "../../Models/product.model.js";

export const getUserWishlistService = async (userId) => {
  const wishlist = await Wishlist.findOne({ user: userId })
    .populate({
      path: "products",
      populate: {
        path: "team",
        select: "name",
      },
    });

  if (!wishlist) return { products: [] };

  
  wishlist.products = wishlist.products.filter(
    p => p && !p.isDeleted && p.status === "Active"
  );

  return wishlist;
};

 
export const addToWishlistService = async ({ userId, productId }) => {
   
  const product = await Product.findOne({
    _id: productId,
    isDeleted: false,
    status: "Active",
  });

  if (!product) throw new Error("Product unavailable");

  let wishlist = await Wishlist.findOne({ user: userId });

  if (!wishlist) {
    wishlist = new Wishlist({ user: userId, products: [] });
  }

  const alreadyExists = wishlist.products.some(
    p => String(p) === String(productId)
  );

  if (!alreadyExists) {
    wishlist.products.push(productId);
    await wishlist.save();
  }
};


export const removeFromWishlistService = async ({ userId, productId }) => {
  await Wishlist.updateOne(
    { user: userId },
    { $pull: { products: productId } }
  );
};