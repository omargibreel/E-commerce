import { Cart } from "../../../db/models/cart.model.js";
import { Product } from "../../../db/models/product.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// add to cart
export const addToCart = asyncHandler(async (req, res, next) => {
  // data productId,qty
  const { productId, quantity } = req.body;
  // check product
  const product = await Product.findById(productId);
  if (!product) return next(new Error("product not found!", { cause: 404 }));

  // check stock
  if (!product.inStock(quantity))
    return next(
      new Error(`Sorry, only ${product.availableItems} items left on the stock`)
    );

  // add to cart
  // check the product existance in the cart

  const isProductInCart = await Cart.findOne({
    user: req.user._id,
    "products.productId": productId,
  });
  if (isProductInCart) {
    isProductInCart.products.forEach((productObj) => {
      if (
        productObj.productId.toString() === productId.toString() &&
        productObj.quantity + quantity < product.availableItems
      ) {
        productObj.quantity = productObj.quantity + quantity;
      }
    });
    await isProductInCart.save();
    // send response
    return res.json({
      success: true,
      results: isProductInCart,
      message: "product added successfully!",
    });
  } else {
    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $push: { products: { productId, quantity } } },
      { new: true }
    );
    console.log(product.availableItems);
    // send response
    return res.json({
      success: true,
      results: cart,
      message: "product added successfully!",
    });
  }
});

// user cart
export const userCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate({
    path: "products.productId",
    select: "name price availableItems dicount finalPrice",
  });
  return res.json({ success: true, results: cart });
});

// update cart

export const updateCart = asyncHandler(async (req, res, next) => {
  // data productId,qty
  const { productId, quantity } = req.body;
  // check product
  const product = await Product.findById(productId);
  if (!product) return next(new Error("product not found!", { cause: 404 }));

  // check stock
  if (!product.inStock(quantity))
    return next(
      new Error(`Sorry, only ${product.availableItems} items left on the stock`)
    );
  // update product
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id, "products.productId": productId },
    { $set: { "products.$.quantity": quantity } },
    { new: true }
  );

  // send response

  return res.json({
    success: true,
    results: cart,
    message: "cart updated successfully!",
  });
});

// remove product from cart schema
export const removeProductFromCart = asyncHandler(async (req, res, next) => {
  // check product
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    { $pull: { products: { productId: req.params.productId } } },
    { new: true }
  );
  // response
  return res.json({
    success: true,
    results: cart,
    message: "product remove successfully",
  });
});

// clearCart
export const clearCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    { products: [] },
    { new: true }
  );
  return res.json({
    success: true,
    results: cart,
    message: "cart cleared!",
  });
});
