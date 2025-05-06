import express, { Router } from "express";
import {
  login,
  resetPassword,
  signUp,
  updatePassword,
  verifyUser,
  verifyResetPassword,
} from "../controller/auth.controller";

const router: Router = express.Router();

router.post("/signup", signUp);
router.post("/verify-signup", verifyUser);
router.post("/login", login);
router.post("/reset-password", resetPassword);
router.post("/verify-reset-password", verifyResetPassword);
router.post("/update-password", updatePassword);

export default router;
