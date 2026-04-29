import { Coupon } from "../../Models/coupon.model.js";

// 🔹 Get all
export const getAllCouponsService = async () => {
  return await Coupon.find().sort({ createdAt: -1 });
};

// 🔹 Create
export const createCouponService = async (data) => {
  let { code, discountPercent, minPurchase, expiryDate } = data;

  code = code.trim().toUpperCase();

  if (!code) throw new Error("Coupon code required");

  if (discountPercent <= 0 || discountPercent > 100)
    throw new Error("Invalid discount percent");

  if (minPurchase < 0)
    throw new Error("Invalid minimum purchase");

  if (new Date(expiryDate) <= new Date())
    throw new Error("Expiry must be future date");

  const existing = await Coupon.findOne({ code });
  if (existing) throw new Error("Coupon already exists");

  return await Coupon.create({
    code,
    discountPercent,
    minPurchase,
    expiryDate,
  });
};

// 🔹 Update
export const updateCouponService = async (id, data) => {
  let { code, discountPercent, minPurchase, expiryDate } = data;

  code = code?.trim().toUpperCase();

  // ❌ validations (same as create)
  if (!code) throw new Error("Coupon code required");

  if (!discountPercent || discountPercent <= 0 || discountPercent > 100) {
    throw new Error("Discount must be between 1 and 100");
  }

  if (minPurchase < 0) {
    throw new Error("Minimum purchase cannot be negative");
  }

  if (!expiryDate || new Date(expiryDate) <= new Date()) {
    throw new Error("Expiry date must be in the future");
  }

  // ❌ duplicate check (exclude current id)
  const existing = await Coupon.findOne({
    code,
    _id: { $ne: id },
  });

  if (existing) throw new Error("Coupon code already exists");

  return await Coupon.findByIdAndUpdate(
    id,
    {
      code,
      discountPercent,
      minPurchase,
      expiryDate,
    },
    { new: true }
  );
};

// 🔹 Delete
export const deleteCouponService = async (id) => {
  return await Coupon.findByIdAndDelete(id);
};