import { Request, Response, NextFunction } from "express";
import {
  checkOtpRestriction,
  sendOtp,
  trackOtpRequest,
  validateOtp,
  validateRegistrationData,
} from "../utils/auth.helper";
import { ValidationError } from "@packages/error-handler";
import prisma from "@packages/libs/prisma";
import bcrypt from "bcrypt";

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

export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate data before creating a new user
    validateRegistrationData(req, "user");
    const { email, otp, password, name } = req.body;
    // Check if user already exits.
    const userAlreadyExits = await prisma.user.findUnique({ where: { email } });
    if (userAlreadyExits) {
      return next(new ValidationError("User already exists"));
    }
    await validateOtp(email, otp, next);

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: newUser,
    });

    // if not, verify the user
    // if yes, return the user
  } catch (error: any) {
    return next(error);
  }
};
