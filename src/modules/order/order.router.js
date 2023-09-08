import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { isValid } from "../../middleware/validation.middelware.js";
import { cancelOrderSchema, createOrderSchema } from "./order.validation.js";
import { cancelOrder, createOrder, orderWebhook } from "./order.controller.js";
import express from "express";
const router = Router();

// create order
router.post("/", isAuthenticated, isValid(createOrderSchema), createOrder);

// cancel order
router.patch(
  "/:orderId",
  isAuthenticated,
  isValid(cancelOrderSchema),
  cancelOrder
);

// webhook endpoint --> stripe

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret =
  "whsec_2860b4cd19bb79c6c28133fd37b96bb760215ceda7478e0c2ac62be23b00472e";

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  orderWebhook
);

export default router;
