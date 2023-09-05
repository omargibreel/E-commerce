import mongoose, { model, Schema, Types } from "mongoose";

// schema
const categorySchema = new Schema(
  {
    name: { type: String, required: true, min: 5, max: 20 },

    slug: { type: String }, //mobile-phone

    createdBy: {
      type: Types.ObjectId,

      ref: "User",

      required: true,
    },
    brandId: { type: Types.ObjectId, ref: "Brand" },

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

categorySchema.virtual("Subcategory", {
  ref: "Subcategory",
  localField: "_id",
  foreignField: "categoryId",
});

// model
export const Category =
  mongoose.models.Category || model("Category", categorySchema);

// export const categoty
