import express, { Router } from "express";
import { signUp } from "../controller/auth.controller";

const router: Router = express.Router();

router.post("/signup", signUp);

export default router;
