import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    full_name: { type: String, required: true },
    phone_no: { type: String, required: true },

    alt_phone_no: { type: String, default: "" },

    address_line1: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pin_code: { type: String, required: true },

    type: { type: String, enum: ["Home", "Work"], required: true },
    country: { type: String, default: "India" },

    is_default: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Address", addressSchema);
