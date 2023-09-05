import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { isValid } from "../../middleware/validation.middelware.js";
import {
  addToCart,
  clearCart,
  removeProductFromCart,
  updateCart,
  userCart,
} from "./cart.controller.js";
import { cartSchema, removeProductFromCartSchema } from "./cart.validation.js";

const router = Router();

// CRUD
// add peoduct cart

router.post("/", isAuthenticated, isValid(cartSchema), addToCart);

// user cart
router.get("/", isAuthenticated, userCart);

// update cart
router.patch("/", isAuthenticated, isValid(cartSchema), updateCart);

// clear cart
router.put("/clear", isAuthenticated, clearCart);

// remove product from cart
router.patch(
  "/:productId",
  isAuthenticated,
  isValid(removeProductFromCartSchema),
  removeProductFromCart
);

export default router;
