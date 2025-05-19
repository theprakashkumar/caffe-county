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
} from "../controller/auth.controller";
import isAuthenticated from "@packages/middleware/isAuthenticated";

const router: Router = express.Router();

router.post("/signup", signUp);
router.post("/verify-signup", verifyUser);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.get("/logged-in-user", isAuthenticated, getUser);
router.post("/reset-password", resetPassword);
router.post("/verify-reset-password", verifyResetPassword);
router.post("/update-password", updatePassword);

export default router;
