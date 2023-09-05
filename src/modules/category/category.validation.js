import joi from "joi";
import { isValidObjectId } from "../../middleware/validation.middelware.js";

// create category schema

export const createCategorySchema = joi.object({
  name: joi.string().min(5).max(20).required(),
  createdBy: joi.string().custom(isValidObjectId),
});

// update category
export const updateCategorySchema = joi
  .object({
    name: joi.string().min(5).max(20),
    categoryId: joi.string().custom(isValidObjectId),
  })
  .required();

// delete category
export const deleteCategorySchema = joi
  .object({
    categoryId: joi.string().custom(isValidObjectId),
  })
  .required();
