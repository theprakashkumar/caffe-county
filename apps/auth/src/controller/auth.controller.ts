import { Request, Response, NextFunction } from "express";
import {
  checkOtpRestriction,
  sendOtp,
  trackOtpRequest,
  validateOtp,
  validateRegistrationData,
  verifyForgotPasswordOtp,
} from "../utils/auth.helper";
import { AuthError, ValidationError } from "@packages/error-handler";
import prisma from "@packages/libs/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { setCookie } from "../utils/cookies/setCookies";
import { isValidEmail } from "@packages/libs/validation";

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
  } catch (error: any) {
    return next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    // Validation
    if (!email || !password) {
      return next(new ValidationError("Email and password are required!"));
    }

    if (!isValidEmail(email)) {
      return next(new ValidationError("Email is not valid!"));
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return next(new AuthError("User not found!"));

    const isPasswordMatch = await bcrypt.compare(password, user.password!);
    if (!isPasswordMatch) {
      return next(new AuthError("Invalid email or password!"));
    }
    // Generate a new user token.
    const accessToken = jwt.sign(
      { id: user.id, role: "user" },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "15m" }
    );
    // Refresh token.
    const refreshToken = jwt.sign(
      { id: user.id, role: "user" },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: "7d" }
    );
    // Send token
    setCookie(res, "refresh_token", refreshToken);
    setCookie(res, "access_token", accessToken);

    res.status(200).json({
      message: "Login successful!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    return next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email) {
      return next(new ValidationError("Email is required!"));
    }

    if (!isValidEmail(email)) {
      return next(new ValidationError("Email is not valid!"));
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return next(new AuthError("User not found!"));
    }

    // Check OTP restrictions
    await checkOtpRestriction(email, next);
    await trackOtpRequest(email, next);
    await sendOtp(user.name, email, "password-reset-mail");

    res.status(201).json({
      message: "Sent OTP to the registered email.",
    });
  } catch (error) {
    next(error);
  }
};

export const verifyResetPassword = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  verifyForgotPasswordOtp(req, res, next);
};

export const updatePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, otp } = req.body;

    if (!email || !password || !otp) {
      return next(new ValidationError("Didn't get all fields!"));
    }

    if (!isValidEmail(email)) {
      return next(new ValidationError("Email is not valid!"));
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return next(new AuthError("User not found!"));
    }

    // Validate OTP before proceeding
    await validateOtp(email, otp, next);

    const isSamePassword = await bcrypt.compare(password, user.password!);
    if (isSamePassword) {
      return next(
        new ValidationError("Password must be different than old one.")
      );
    }

    const hashedNewPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { email },
      data: {
        password: hashedNewPassword,
      },
    });

    res.status(200).json({
      message: "Password has been updated!",
    });
  } catch (error) {
    next(error);
  }
};
