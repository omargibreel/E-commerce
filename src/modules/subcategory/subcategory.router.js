import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middleware.js";
import { isValid } from "../../middleware/validation.middelware.js";
import { fileUpload, filterObject } from "../../utils/multer.js";
import {
  updateSubCategorySchema,
  createSubCategorySchema,
  deleteSubCategorySchema,
} from "./subcategory.validation.js";
import {
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  allSubcategories,
} from "./subcategory.controller.js";
const router = Router({ mergeParams: true });
// CRUD
// create
router.post(
  "/",
  isAuthenticated,
  isAuthorized("admin"),
  fileUpload(filterObject.image).single("subcategory"),
  isValid(createSubCategorySchema),
  createSubcategory
);

// update
router.patch(
  "/:subcategoryId",
  isAuthenticated,
  isAuthorized("admin"),
  fileUpload(filterObject.image).single("subcategory"),
  isValid(updateSubCategorySchema),
  updateSubcategory
);

// delete
router.delete(
  "/:subcategoryId",
  isAuthenticated,
  isAuthorized("admin"),
  isValid(deleteSubCategorySchema),
  deleteSubcategory
);

// read
router.get("/", allSubcategories);

export default router;
