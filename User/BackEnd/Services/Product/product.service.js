import mongoose from "mongoose";
import { Product } from "../../Models/product.model.js";

export const fetchProductDetailsService = async (slug) => {
  const product = await Product.findOne({
    slug,
    isDeleted: false,
    status: "Active",
  }).lean();

  if (!product) return null;

  const validVariants = (product.variants || []).filter(
    v => v.stock > 0 && v.price > 0
  );

  product.displayPrice = validVariants.length
    ? Math.min(...validVariants.map(v => v.price))
    : 0;

  product.totalStock = (product.variants || []).reduce(
    (sum, v) => sum + Number(v.stock || 0),
    0
  );
  return product;
};

export const fetchRelatedProductsService = async (product) => {
  if (!product || !product.team) return [];

  const relatedProducts = await Product.find({
    team: product.team,
    status: "Active",
    isDeleted: false,
    _id: { $ne: new mongoose.Types.ObjectId(product._id) },
  })
    .limit(4)
    .lean();

  return relatedProducts.map((p) => {
    const validVariants = (p.variants || []).filter(
      v => v.stock > 0 && v.price > 0
    );

    return {
      ...p,
      displayPrice: validVariants.length
        ? Math.min(...validVariants.map(v => v.price))
        : 0,
    };
  });
};

