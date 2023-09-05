import { Cart } from "../../../db/models/cart.model.js";
import { Product } from "../../../db/models/product.model.js";

// clear cart
export const clearCart = async (userId) => {
  await Cart.findOneAndUpdate({ user: userId }, { products: [] });
};
// update stock
export const updateStock = async (products, placeOrder) => {
  if (placeOrder) {
    for (const product of products) {
      await Product.findByIdAndUpdate(product.productId, {
        $inc: {
          availableItems: -product.quantity,
          soldItems: product.quantity,
        },
      });
    }
  } else {
    for (const product of products) {
      await Product.findByIdAndUpdate(product.productId, {
        $inc: {
          availableItems: product.quantity,
          soldItems: -product.quantity,
        },
      });
    }
  }
};
