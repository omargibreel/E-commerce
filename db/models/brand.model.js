import mongoose, { model, Schema, Types } from "mongoose";

// schema
const brandSchema = new Schema(
  {
    name: { type: String, required: true, min: 5, max: 20 },

    slug: { type: String }, //mobile-phone

    createdBy: {
      type: Types.ObjectId,

      ref: "User",

      required: true,
    },

    image: {
      url: { type: String, required: true },

      id: { type: String, required: true },
    },
  },

  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// model
export const Brand = mongoose.models.Brand || model("Brand", brandSchema);

// export const categoty
