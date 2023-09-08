import { Cart } from "../../../db/models/cart.model.js";
import { Coupon } from "../../../db/models/coupon.model.js";
import { Order } from "../../../db/models/order.model.js";
import { Product } from "../../../db/models/product.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { createInvoice } from "../../utils/createIvoice.js";
import { sendEmail } from "../../utils/sendEmail.js";
import { fileURLToPath } from "url";
import cloudinary from "../../utils/cloud.js";
import path from "path";
import { clearCart, updateStock } from "./order.service.js";
import Stripe from "stripe";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const createOrder = asyncHandler(async (req, res, next) => {
  // data
  const { payment, address, phone, coupon } = req.body;
  // check coupon
  let checkCoupon;
  if (coupon) {
    checkCoupon = await Coupon.findOne({
      name: coupon,
      expiredAt: { $gt: Date.now() },
    });
    if (!coupon) return next(new Error("Invalid Coupon!"));
  }

  // check cart
  const cart = await Cart.findOne({ user: req.user._id });
  const products = cart.products;
  if (products.length < 1) return next(new Error("Empty cart!"));

  let orderProducts = [];
  let orderPrice = 0;

  // check products
  for (let i = 0; i < products.length; i++) {
    // check product existence
    const product = await Product.findById(products[i].productId);
    if (!product)
      return next(new Error(`product ${products[i].productId} not found!`));
    // check product stock
    if (!product.inStock(products[i].quantity))
      return next(
        new Error(
          `${product.name} out of stock, only ${product.availableItems} items are left`
        )
      );
    orderProducts.push({
      productId: product._id,
      quantity: products[i].quantity,
      name: product.name,
      itemPrice: product.finalPrice,
      totalPrice: products[i].quantity * product.finalPrice,
    });
    orderPrice += products[i].quantity * product.finalPrice;
  }

  // create order
  const order = await Order.create({
    user: req.user._id,
    products: orderProducts,
    address,
    phone,
    coupon: {
      id: checkCoupon?._id,
      name: checkCoupon?.name,
      discount: checkCoupon?.discount,
    },
    payment,
    price: orderPrice,
  });
  // generate invoice
  const user = req.user;
  const invoice = {
    shipping: {
      name: user.userName,
      address: order.address,
      country: "Egypt",
    },
    items: order.products,
    subtotal: order.price,
    paid: order.finalPrice,
    invoice_nr: order._id,
  };
  const pdfPath = path.join(
    __dirname,
    `./../../../invoiceTemp/${order._id}.pdf`
  );
  createInvoice(invoice, pdfPath);
  // uplode cloudinary
  const { secure_url, public_id } = await cloudinary.uploader.upload(pdfPath, {
    folder: `${process.env.FOLDER_CLOUD_NAME}/order/invoice/${user._id}`,
  });

  // TODO delete file from filesystem

  // add invoice to order
  order.invoice = { id: public_id, url: secure_url };
  await order.save();
  console.log(secure_url);
  const isSent = await sendEmail({
    to: user.email,
    subject: "Order invoice",
    attachments: [
      {
        path: secure_url,
        contentType: "application/pdf",
      },
    ],
  });

  if (isSent) {
    // update stock
    updateStock(order.products, true);
    // clear cart
    clearCart(user._id);
  }

  // Stripe payment
  if (payment == "visa") {
    const stripe = new Stripe(process.env.STRIPE_KEY);
    // coupon
    let existCoupon;
    if (order.coupon.name !== undefined) {
      existCoupon = await stripe.coupons.create({
        percent_off: order.coupon.discount,
        duration: "once",
      });
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      metadata: { order_id: order.toString() },
      success_url: process.env.SUCCESS_URL,
      cancel_url: process.env.CANCEL_URL,
      line_items: order.products.map((product) => {
        return {
          price_data: {
            currency: "EGP",
            product_data: {
              name: product.name,
            },
            unit_amount: product.itemPrice * 100,
          },
          quantity: product.quantity,
        };
      }),
      discounts: existCoupon ? [{ coupon: existCoupon.id }] : [],
    });
    return res.json({ success: true, results: session.url });
  }

  // response
  return res.json({
    success: true,
    message: "order placed successfully! please chseck your email!",
  });
});

// cancel order
export const cancelOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) return next(new Error("order not found!"));
  if (order.status === "shipped" || order.status === "delivered")
    return next(new Error("Can not cancel order!"));
  order.status = "canceled";
  await order.save();
  updateStock(order.products, false);
  return res.json({ success: true, message: "order canceled successfully!" });
});

// order webhook
export const orderWebhook = asyncHandler(async (request, response) => {
  const stripe = new Stripe(process.env.STRIPE_KEY);
  const sig = request.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      request.body,
      sig,
      process.env.ENDPOINT_SECRETS
    );
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
    S;
  }

  // Handle the event
  const orderId = event.data.object.metadata.order_id;
  if (event.type === "checkout.session.completed") {
    // change order status
    await Order.findOneAndUpdate({ _id: orderId }, { status: "visa payed" });
    return;
  }
  await Order.findOneAndUpdate({ _id: orderId }, { status: "failed to pay" });
  return;
  // Return a 200 response to acknowledge receipt of the event
  response.send();
});
