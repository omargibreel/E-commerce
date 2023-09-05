import joi from "joi";
import { isValidObjectId } from "../../middleware/validation.middelware.js";

// crete subcategory
export const createSubCategorySchema = joi
  .object({
    name: joi.string().min(3).max(20).required(),
    categoryId: joi.string().custom(isValidObjectId).required(),
  })
  .required();

// update
export const updateSubCategorySchema = joi
  .object({
    categoryId: joi.string().custom(isValidObjectId).required(),
    subcategoryId: joi.string().custom(isValidObjectId).required(),
    name: joi.string().min(3).max(20),
  })
  .required();

export const deleteSubCategorySchema = joi
  .object({
    categoryId: joi.string().custom(isValidObjectId).required(),
    subcategoryId: joi.string().custom(isValidObjectId).required(),
  })
  .required();
