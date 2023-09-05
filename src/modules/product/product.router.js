import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middleware.js";
import { fileUpload, filterObject } from "../../utils/multer.js";
import { isValid } from "../../middleware/validation.middelware.js";
import { createProductSchema, productIdSchema } from "./product.validation.js";
import {
  addProduct,
  allProducts,
  deleteProduct,
  singleProduct,
} from "./product.controller.js";

const router = Router({ mergeParams: true });

// CRUD

// create product
router.post(
  "/",
  isAuthenticated,
  isAuthorized("admin"),
  fileUpload(filterObject.image).fields([
    { name: "defaultImage", maxCount: 1 },
    { name: "subImages", maxCount: 3 },
  ]),
  isValid(createProductSchema),
  addProduct
);

// delete product
router.delete(
  "/:productId",
  isAuthenticated,
  isAuthorized("admin"),
  isValid(productIdSchema),
  deleteProduct
);

// get all products
router.get("/", allProducts);

// all product of certain category
//categoryId ???
router.get("/category");

// single product
router.get("/single/:productId", isValid(productIdSchema), singleProduct);

export default router;
