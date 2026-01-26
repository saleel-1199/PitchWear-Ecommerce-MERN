import mongoose from "mongoose";

import { Product } from "../../Models/product.model.js";

export const fetchProductDetailsService = async (productId) => {
  return await Product.findById(productId).lean();
};




export const fetchRelatedProductsService = async (product) => {
  if (!product || !product.team) return [];

  return Product.find({
    team: product.team,
    status: "Active",
    isDeleted: false,
    _id: { $ne: product._id }, // ✅ this works (mongoose auto-casts)
  })
    .limit(4)
    .lean();
};
