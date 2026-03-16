import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({

  code: {
    type: String,
    unique: true
  },

  discountPercent: Number,

  minPurchase: Number,

  expiryDate: Date,

  isActive: {
    type: Boolean,
    default: true
  }

},{timestamps:true})

export const Coupon = mongoose.model("Coupon",couponSchema)