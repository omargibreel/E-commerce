import joi from "joi";
import { isValidObjectId } from "./../../middleware/validation.middelware.js";

// create product schema
export const createProductSchema = joi
  .object({
    name: joi.string().required().min(2).max(20),
    description: joi.string(),
    availableItems: joi.number().min(1).required(),
    price: joi.number().min(1).required(),
    discount: joi.number().min(1).max(100),
    category: joi.string().custom(isValidObjectId).required(),
    subcategory: joi.string().custom(isValidObjectId).required(),
    brand: joi.string().custom(isValidObjectId).required(),
  })
  .required();

// create delete product schema
// delete product + read single product
export const productIdSchema = joi
  .object({
    productId: joi.string().custom(isValidObjectId).required(),
  })
  .required();
