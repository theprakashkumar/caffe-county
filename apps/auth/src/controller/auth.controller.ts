import { Request, Response, NextFunction } from "express";
import {
  checkOtpRestriction,
  sendOtp,
  trackOtpRequest,
  validateRegistrationData,
} from "../utils/auth.helper";
import { ValidationError } from "../../../../packages/error-handler";
import prisma from "../../../../packages/libs/prisma";

// Register a new User

export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate data before creating a new user
    validateRegistrationData(req, "user");
    const { name, email } = req.body;
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      // It passes the error to the error handling middleware
      return next(new ValidationError("User already exists"));
    }

    await checkOtpRestriction(email, next);
    await trackOtpRequest(email, next);
    await sendOtp(name, email, "user-activation-mail");

    res.status(200).json({
      message: "OTP sent to your email!",
    });
  } catch (error: any) {
    console.log("somethign");
    next(error);
  }
};
