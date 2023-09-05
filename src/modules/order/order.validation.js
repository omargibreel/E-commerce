import joi from "joi";
import { isValidObjectId } from "../../middleware/validation.middelware.js";
// create order schema
export const createOrderSchema = joi
  .object({
    address: joi.string().min(10).required(),
    coupon: joi.string().min(5),
    phone: joi.string().required(),
    payment: joi.string().valid("cash", "visa").required(),
  })
  .required();

//cancelOrderSchema
export const cancelOrderSchema = joi
  .object({
    orderId: joi.string().custom(isValidObjectId).required(),
  })
  .required();
