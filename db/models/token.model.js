import mongoose, { Types, Schema, model } from "mongoose";

// Schema
const tokenSchema = new Schema(
  {
    token: {
      type: String,
      required: true,
    },

    user: {
      type: Types.ObjectId,
      ref: "User",
    },

    isValid: {
      type: Boolean,
      default: true,
    },

    agent: {
      type: String,
    },

    expiredAt: String,
  },

  { timestamps: true }
);

// Model

export const Token = mongoose.models.Token || model(`Token`, tokenSchema);
