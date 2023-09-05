import slugify from "slugify";
import { Category } from "../../../db/models/category.model.js";
import { Subcategory } from "../../../db/models/subcategory.model.js";
import cloudinary from "../../utils/cloud.js";
import { asyncHandler } from "./../../utils/asyncHandler.js";

// create subcategory
export const createSubcategory = asyncHandler(async (req, res, next) => {
  // categoryId from ?? make router = Router({merge params:true})
  const { categoryId } = req.params;

  // check file
  if (!req.file) return next(new Error("Image is required", { cause: 400 }));

  //check category
  const category = await Category.findById(categoryId);
  if (!category) return next(new Error("Category not found", { cause: 404 }));

  // upload file
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    { folder: `${process.env.FOLDER_CLOUD_NAME}/subcategory` }
  );

  // save in database
  const subcategory = await Subcategory.create({
    name: req.body.name,
    slug: slugify(req.body.name),
    createdBy: req.user._id,
    image: { id: public_id, url: secure_url },
    categoryId,
  });
  return res.json({ success: true, results: subcategory });
});

// update Subcategory
export const updateSubcategory = asyncHandler(async (req, res, next) => {
  // check category
  const category = await Category.findById(req.params.categoryId);
  if (!category) return next(new Error("categoty not found", { cause: 404 }));

  // check subcategory
  const subcategory = await Subcategory.findOne({
    _id: req.params.subcategoryId,
    categoryId: req.params.categoryId, // check sub is child of parent
  });
  if (!subcategory)
    return next(new Error("Subcategoty not found", { cause: 404 }));

  //  check owner
  if (req.user._id.toString() !== subcategory.createdBy.toString())
    return next(new Error("You are not authorized"));

  // name ?
  subcategory.name = req.body.name ? req.body.name : subcategory.name;
  subcategory.slug = slugify(req.body.name);

  // file ?

  if (req.file) {
    const { secure_url } = await cloudinary.uploader.upload(req.file.path, {
      public_id: subcategory.image.id,
    });
    subcategory.image.url = secure_url;
  }
  await subcategory.save();
  return res.json({
    success: true,
    message: "updated successfully!",
    results: subcategory,
  });
});

// delete subcategory
export const deleteSubcategory = asyncHandler(async (req, res, next) => {
  // check category
  const category = await Category.findById(req.params.categoryId);
  if (!category) return next(new Error("categoty not found", { cause: 404 }));

  // check subcategory and delete
  const subcategory = await Subcategory.findOneAndDelete({
    _id: req.params.subcategoryId,
    categoryId: req.params.categoryId, // check sub is child of parent
  });
  if (!subcategory)
    return next(new Error("Subcategoty not found", { cause: 404 }));

  //  check owner
  if (req.user._id.toString() !== subcategory.createdBy.toString())
    return next(new Error("You are not authorized"));

  return res.json({
    success: true,
    message: "subcategory deleted successfully!",
    results: subcategory,
  });
});

// get all subcategories

export const allSubcategories = asyncHandler(async (req, res, next) => {
  const subcategories = await Subcategory.find().populate([
    {
      path: "categoryId",
      select: "name",
    },
    {
      path: "createdBy",
    },
  ]);
  return res.json({ success: true, results: subcategories });
});
