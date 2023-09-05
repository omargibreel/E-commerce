import mongoose, { Schema, Types, model } from "mongoose";

// schema
const cartSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true, unique: true },
    products: [
      {
        productId: { type: Types.ObjectId, ref: "Product", unique: true },
        quantity: { type: Number, default: 1 },
      },
    ],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// model
export const Cart = mongoose.models.Cart || model("Cart", cartSchema);
