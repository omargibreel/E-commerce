import joi from "joi";
import { isValidObjectId } from "../../middleware/validation.middelware.js";

// create brand schema

export const createBrandSchema = joi.object({
  name: joi.string().min(4).max(20).required(),
});

// update brand
export const updateBrandSchema = joi
  .object({
    name: joi.string().min(4).max(20),
    brandId: joi.string().custom(isValidObjectId).required(),
  })
  .required();

// delete brand
export const deleteBrandSchema = joi
  .object({
    brandId: joi.string().custom(isValidObjectId).required(),
  })
  .required();
