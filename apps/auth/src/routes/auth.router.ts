import express, { Router } from "express";
import {
  login,
  resetPassword,
  signUp,
  updatePassword,
  verifyUser,
  verifyResetPassword,
  refreshToken,
  getUser,
  registerSeller,
  verifySeller,
  createShop,
  createStripConnectLink,
  loginSeller,
  getSeller,
} from "../controller/auth.controller";
import isAuthenticated from "@packages/middleware/isAuthenticated";
import { isSeller } from "@packages/middleware/authorizeRoles";

const router: Router = express.Router();

router.post("/signup", signUp);
// Verify user by OTP.
router.post("/verify-signup", verifyUser);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
// Get currently logged in user.
router.get("/logged-in-user", isAuthenticated, getUser);
// Request to reset password.
router.post("/reset-password", resetPassword);
// Verify the OTP.
router.post("/verify-reset-password", verifyResetPassword);
// Process the update password request.
router.post("/update-password", updatePassword);
router.post("/seller-registration", registerSeller);
router.post("/verify-seller", verifySeller);
router.post("/create-shop", createShop);
router.post("/create-stripe-link", createStripConnectLink);
router.post("/login-seller", loginSeller);
router.get("logged-in-seller", isAuthenticated, isSeller, getSeller);

export default router;
