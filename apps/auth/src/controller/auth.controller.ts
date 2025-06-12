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
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { setCookie } from "../utils/cookies/setCookies";
import { isValidEmail } from "@packages/libs/validation";
import Stripe from "stripe";

// Create an instance of Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

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

    res.clearCookie("seller-access-token");
    res.clearCookie("seller-refresh-token");

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

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken =
      req.cookies.redirect_token ||
      req.cookies.seller_refresh_token ||
      req.headers.authorization?.split(" ")[1];

    if (!refreshToken) {
      return new ValidationError("Unauthorized! NO refresh token!");
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    ) as { id: string; role: string };

    if (!decoded || decoded.id || !decoded.role) {
      return new JsonWebTokenError("Forbidden! Invalid refresh token.");
    }

    let account;

    if (decoded.role === "user") {
      account = await prisma.user.findUnique({ where: { id: decoded.id } });
    } else if (decoded.role === "seller") {
      account = await prisma.seller.findUnique({ where: { id: decoded.id } });
    }

    if (!account) {
      return new AuthError("Forbidden! User not found.");
    }

    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "15m" }
    );

    if (decoded.role === "user") {
      setCookie(res, "access_token", newAccessToken);
    } else if (decoded.role === "seller") {
      setCookie(res, "seller_access_token", newAccessToken);
    }

    return res.status(201).json({ success: true });
  } catch (error) {
    return next(error);
  }
};

export const getUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
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

// Register Seller
export const registerSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRegistrationData(req, "seller");

    const { name, email } = req.body;

    const existingSeller = await prisma.seller.findUnique({ where: { email } });

    if (existingSeller) {
      return new ValidationError("Seller already exist!");
    }

    await checkOtpRestriction(email, next);
    await trackOtpRequest(email, next);
    await sendOtp(name, email, "seller-activation");

    res
      .status(200)
      .json({ message: "OTP sent to email. Please verify your account." });
  } catch (error) {
    next(error);
  }
};

// Verify seller with OTP.
export const verifySeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate data before creating a new seller
    validateRegistrationData(req, "seller");
    const { email, otp, password, phone, country, name } = req.body;
    // Check if user already exits.
    const sellerAlreadyExits = await prisma.seller.findUnique({
      where: { email },
    });
    if (sellerAlreadyExits) {
      return next(new ValidationError("Seller already exists"));
    }
    await validateOtp(email, otp, next);

    const hashedPassword = await bcrypt.hash(password, 10);

    const newSeller = await prisma.seller.create({
      data: { name, email, password: hashedPassword, phone, country },
    });

    res.status(201).json({
      success: true,
      message: "Seller created successfully",
      seller: newSeller,
    });
  } catch (error: any) {
    return next(error);
  }
};

// Verify seller with OTP.
export const createShop = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, bio, address, openingHours, website, category, sellerId } =
      req.body;

    // Validation: If required data is not present then send validation error.
    if (!name || !bio || !address || !openingHours || !category || !sellerId) {
      return new ValidationError("All fields are required!");
    }

    const shopData = {
      name,
      bio,
      address,
      openingHours,
      category,
      sellerId,
      website,
    };

    if (website && website.trim() !== "") {
      shopData.website = website;
    }

    const shop = await prisma.shops.create({
      data: shopData,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      shop: shop,
    });
  } catch (error: any) {
    return next(error);
  }
};

// Create Strip connect account link
export const createStripConnectLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sellerId } = req.body;

    if (!sellerId) {
      return next(new ValidationError("Seller id is required."));
    }

    const seller = await prisma.seller.findUnique({
      where: {
        id: sellerId,
      },
    });

    if (!seller) {
      return next(new ValidationError("Seller is not available with this id!"));
    }

    const account = await stripe.accounts.create({
      type: "express",
      email: seller?.email,
      country: "GB",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    // store account in DB
    await prisma.seller.update({
      where: {
        id: sellerId,
      },
      data: {
        stripeId: account.id,
      },
    });

    // refresh url is url where user will be redirect with strip account is created
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: "http://localhost:3000/success",
      return_url: "http://localhost:3000/success",
      type: "account_onboarding",
    });

    res.json({ url: accountLink.url });
  } catch (error) {
    return next(error);
  }
};

export const loginSeller = async (
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

    const seller = await prisma.seller.findUnique({ where: { email } });
    if (!seller) return next(new AuthError("Seller not found!"));

    const isPasswordMatch = await bcrypt.compare(password, seller.password!);
    if (!isPasswordMatch) {
      return next(new AuthError("Invalid email or password!"));
    }

    res.clearCookie("access-token");
    res.clearCookie("refresh-token");

    // Generate a new user token.
    const accessToken = jwt.sign(
      { id: seller.id, role: "seller" },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "15m" }
    );
    // Refresh token.
    const refreshToken = jwt.sign(
      { id: seller.id, role: "seller" },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: "7d" }
    );
    // Send token
    setCookie(res, "seller_refresh_token", refreshToken);
    setCookie(res, "seller_access_token", accessToken);

    res.status(200).json({
      message: "Login successful!",
      user: {
        id: seller.id,
        name: seller.name,
        email: seller.email,
      },
    });
  } catch (error: any) {
    return next(error);
  }
};

export const getSeller = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const seller = req.seller;
    res.status(201).json({
      success: true,
      seller,
    });
  } catch (error) {
    next(error);
  }
};
