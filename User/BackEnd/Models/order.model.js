import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    required: true,
  },

  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  
  items: [
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    size: String,
    quantity: Number,
    price: Number,

    status: {
      type: String,
      enum: [
        "Pending",
        "Shipped",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
        "Return Requested",
        "Returned"
      ],
      default: "Pending",
    },

    returnReason: {
      type: String,
    }
  }
],

  subtotal: Number,
  tax: Number,
  deliveryFee: Number,
  discount: Number,
  finalTotal: Number,

  paymentMethod: {
    type: String,
    enum: ["COD","Razorpay","Wallet"],
    default: "COD",
  },
  paymentStatus: {
  type: String,
  enum: ["Pending","Paid","Failed"],
  default: "Pending"
},
couponCode: String,
razorpayOrderId: String,
razorpayPaymentId: String,

  status: {
    type: String,
   enum: [ "Pending","Shipped","Out for Delivery","Delivered","Cancelled","Partially Completed","Returned"],
    default: "Pending",
  },

  addressSnapshot: {
    fullName: String,
    phone: String,
    city: String,
    state: String,
    pincode: String,
    addressLine: String,
  }

}, { timestamps: true });

export const Order = mongoose.model("Order", orderSchema);