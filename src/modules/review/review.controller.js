import { asyncHandler } from "../../utils/asyncHandler.js";
import { Review } from "../../../db/models/reviews.model.js";
import { Product } from "../../../db/models/product.model.js";

export const addReview = asyncHandler(async (req, res, next) => {
  // user , content >> data
  const { content, productId } = req.body;
  //   // check product
  //   if (!(await Product.findById(productId)))
  //     return next(new Error("product not found!"));

  // add review to model
  const review = await Review.create({
    user: req.user._id,
    content,
  });
  // add review to product
  const product = await Product.findByIdAndUpdate(productId, {
    $push: { reviews: { id: review._id } },
  });
  // res
  return res.json({ success: true, message: "Review added successfully!" }); // Corrected "messsage" to "message"
});
