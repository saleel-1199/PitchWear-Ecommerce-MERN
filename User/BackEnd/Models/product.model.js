import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    team: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    images: {
      type: [String],
      required: true,
    },

    type: {
      type: String,
      enum: ["Home", "Away", ""],
      default: "",
    },

    kitType: {
      type: String,
      enum: ["Half Sleeve", "Full Sleeve", ""],
      default: "",
    },

    variants: {
      type: [variantSchema],
      default: [],
    },

    totalStock: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Inactive",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

/* ✅ AUTO CALCULATE TOTAL STOCK */
productSchema.pre("save", function (next) {
  this.totalStock = this.variants.reduce(
    (sum, v) => sum + (v.stock || 0),
    0
  );
  next();
});

export const Product = mongoose.model("Product", productSchema);
