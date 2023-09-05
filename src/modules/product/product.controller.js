import { asyncHandler } from "../../utils/asyncHandler.js";
import { nanoid } from "nanoid";
import slugify from "slugify";
import { Product } from "./../../../db/models/product.model.js";
import { Category } from "./../../../db/models/category.model.js";
import { Subcategory } from "./../../../db/models/subcategory.model.js";
import { Brand } from "./../../../db/models/brand.model.js";
import cloudinary from "../../utils/cloud.js";
// create product
export const addProduct = asyncHandler(async (req, res, next) => {
  // data
  //   const {
  //     name,
  //     description,
  //     price,
  //     discount,
  //     availableItems,
  //     category,
  //     subcategory,
  //     brand,
  //   } = req.body;

  // check category
  const category = await Category.findById(req.body.category);
  if (!category) return next(new Error("category not found!", { cause: 404 }));

  // check subcategory
  const subcategory = await Subcategory.findById(req.body.subcategory);
  if (!subcategory)
    return next(new Error("subcategory not found!", { cause: 404 }));

  // brand
  const brand = await Brand.findById(req.body.brand);
  if (!brand) return next(new Error("brand not found!", { cause: 404 }));

  // file
  if (!req.files)
    return next(new Error("Images are required!", { cause: 400 }));

  // create unique folder name
  const cloudFolder = nanoid();
  let images = [];
  // uploade sub files
  for (const file of req.files.subImages) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      file.path,
      { folder: `${process.env.FOLDER_CLOUD_NAME}/products/${cloudFolder}` }
    );
    images.push({ id: public_id, url: secure_url });
  }

  // upload default image
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.files.defaultImage[0].path,
    { folder: `${process.env.FOLDER_CLOUD_NAME}/products/${cloudFolder}` }
  );

  // create product
  const product = await Product.create({
    ...req.body,
    slug: slugify(req.body.name),
    cloudFolder,
    createdBy: req.user._id,
    defaultImage: { url: secure_url, id: public_id },
    images,
  });

  console.log("product with discount :", product.finalPrice);

  // send response
  return res.status(201).json({ success: true, result: product });
});

// delete product
export const deleteProduct = asyncHandler(async (req, res, next) => {
  // check product
  const product = await Product.findById(req.params.productId);
  if (!product) return next(new Error("product not found!"));
  // check owner
  if (req.user._id.toString() != product.createdBy.toString())
    return next(new Error("Not authorized", { cause: 401 }));

  const imagesArr = product.images;
  const ids = imagesArr.map((Obj) => Obj.id);
  ids.push(product.defaultImage.id);
  console.log(ids);
  // delete images
  const result = await cloudinary.api.delete_resources(ids);
  console.log(result);
  // delete folder
  const x = await cloudinary.api.delete_folder(
    `${process.env.FOLDER_CLOUD_NAME}/products/${product.cloudFolder}`
  );
  console.log(x);
  //  delete product from db
  await Product.findByIdAndDelete(req.params.productId);
  // send respons
  return res.json({ success: true, message: "product deleted successfully!" });
});

// all products
export const allProducts = asyncHandler(async (req, res, next) => {
  if (req.params.categoryId) {
    const category = await Category.findById(req.params.categoryId);
    if (!category)
      return next(new Error("category not found!", { cause: 404 }));
    const products = await Product.find({ category: req.params.categoryId });
    return res.json({ success: true, result: products });
  }
  //******************************* search *********************************/
  // const { keyword } = req.query;
  // const products = await Product.find({
  //   $or: [
  //     { name: { $regex: keyword, $options: "i" } }, // $options: "i" >> case-insensitive
  //     { description: { $regex: keyword, $options: "i" } },
  //   ],
  // });

  const products = await Product.find({ ...req.query })
    .paginate(req.query.page)
    .customSelect(req.query.fields)
    .sort(req.query.fields);
  return res.json({ success: true, result: products });
});

// single product
export const singleProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.productId);
  console.log(product);
  if (!product) return next(new Error("product not found"));
  return res.json({ success: true, result: product });
});
