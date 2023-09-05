import mongoose, { Schema, Types, model } from "mongoose";
// schema
const productSchema = new Schema(
  {
    name: { type: String, required: true, min: 2, max: 20 },
    description: String,
    images: [
      {
        url: { type: String, required: true },

        id: { type: String, required: true },
      },
    ],
    defaultImage: {
      url: { type: String, required: true },

      id: { type: String, required: true },
    },
    availableItems: { type: Number, min: 1, required: true },
    soldItems: { type: Number, default: 0 },
    price: { type: Number, min: 1, required: true },
    discount: { type: Number, min: 1, max: 100 },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    category: { type: Types.ObjectId, ref: "Category", required: true },
    subcategory: { type: Types.ObjectId, ref: "Subategory", required: true },
    brand: { type: Types.ObjectId, ref: "Brand", required: true },
    cloudFolder: { type: String, unique: true, required: true },
  },
  { timestamps: true, strictQuery: true, toJSON: { virtuals: true } } // strictQuery >> only read model fields in the query
);

// virtual
productSchema.virtual("finalPrice").get(function () {
  // this >>>>>> document >>>>>> product {}

  // calculate final price ?! "price" "discount"
  if (this.price) {
    return Number.parseFloat(
      this.price - (this.price * this.discount || 0) / 100
    ).toFixed(2);
  }
});

// query Helper
//******************************* pagination *********************************/
productSchema.query.paginate = function (page) {
  page = !page || page < 1 || isNaN(page) ? 1 : page;
  const limit = 2;
  const skip = (page - 1) * limit;

  return this.skip(skip).limit(limit);
  // this >>> query
  // return query
};

//******************************* selection *********************************/
productSchema.query.customSelect = function (fields) {
  // this >>> query
  // return query

  if (!fields) return this;
  // model keys
  const modelKeys = Object.keys(Product.schema.paths);

  // queryKeys
  const queryKeys = fields.split(" ");

  // matchedKeys
  const matchedKeys = queryKeys.filter((key) => modelKeys.includes(key));
  return this.select(matchedKeys);
};

// stock function
productSchema.methods.inStock = function (requiredQuantity) {
  return this.availableItems >= requiredQuantity ? true : false;
};

// model
export const Product =
  mongoose.models.Product || model("Product", productSchema);
