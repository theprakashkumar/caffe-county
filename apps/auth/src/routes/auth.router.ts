import express, { Router } from "express";
import { signUp, verifyUser } from "../controller/auth.controller";

const router: Router = express.Router();

router.post("/signup", signUp);
router.post("/verify", verifyUser);

export default router;
