import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { addReview } from "./review.controller.js";
const router = Router({ mergeParams: true });

// CRUD
// Create
router.post("/", isAuthenticated, addReview);

export default router;
