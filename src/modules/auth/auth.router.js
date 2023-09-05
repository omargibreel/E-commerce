import Router from "express";
import { isValid } from "../../middleware/validation.middelware.js";
import {
  activateSchema,
  forgetCodeSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "./auth.validation.js";
import {
  activateAccount,
  register,
  login,
  sendForgetCode,
  resetPassword,
} from "./auth.controller.js";
const router = Router();

// Register

router.post("/register", isValid(registerSchema), register);

// Activate Account
router.get(
  "/confirmEmail/:activationCode",
  isValid(activateSchema),
  activateAccount
);

// Login
router.post("/login", isValid(loginSchema), login);
// send forget password code
router.patch("/forgetcode", isValid(forgetCodeSchema), sendForgetCode);

// Reset Password
router.patch("/resetPassword", isValid(resetPasswordSchema), resetPassword);
export default router;
