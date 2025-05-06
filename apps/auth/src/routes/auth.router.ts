import express, { Router } from "express";
import { login, signUp, verifyUser } from "../controller/auth.controller";

const router: Router = express.Router();

router.post("/signup", signUp);
router.post("/verify", verifyUser);
router.post("/login", login);

export default router;
