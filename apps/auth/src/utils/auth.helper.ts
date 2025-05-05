import crypto from "crypto";
import { Request, NextFunction } from "express";
import { ValidationError } from "@packages/error-handler";
import redis from "@packages/libs/redis";
import { sendEmail } from "./sendEmail";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegistrationData = async (
  req: Request,
  userType: "user" | "seller"
) => {
  const { name, email, password, phoneNumber, country } = req.body;
  // Validate if we have all the required fields
  if (
    !name ||
    !email ||
    !password ||
    (userType === "seller" && (!phoneNumber || !country))
  ) {
    throw new ValidationError("All fields are required");
  }
  // Validate email
  if (!emailRegex.test(email)) {
    throw new ValidationError("Invalid email address");
  }
};

export const checkOtpRestriction = async (
  email: string,
  next: NextFunction
) => {
  // If user entered the wrong OTP three times then lock the account for 30 minutes
  if (await redis.get(`otp_lock:${email}`)) {
    return next(
      new ValidationError("Too many OTP requests, please try again 30 minutes")
    );
  }
  // If user generate OTP very frequently
  if (await redis.get(`otp_spam_lock:${email}`)) {
    return next(
      new ValidationError("Too many OTP requests, please try again an hour")
    );
  }
  // wait for 60 seconds before generating another OTP
  if (await redis.get(`otp_cooldown:${email}`)) {
    return next(
      new ValidationError(
        "Please wait for 60 seconds before requesting another OTP"
      )
    );
  }
};

export const sendOtp = async (
  name: string,
  email: string,
  template: string
) => {
  // Generate a random 4 digit OTP
  const otp = crypto.randomInt(1000, 9999).toString();
  // Send Email
  await sendEmail(email, "OTP for Signup", template, {
    name,
    otp,
  });
  // Store the OTP in Redis with a TTL of 5 minutes
  await redis.set(`otp:${email}`, otp, "EX", 300);
  // You can't send the OTP for next 60 seconds
  await redis.set(`otp_cooldown:${email}`, "true", "EX", 60);
};

// Track number of OTP requests
export const trackOtpRequest = async (email: string, next: NextFunction) => {
  const requestKey = `otp_request:${email}`;
  const otpRequest = parseInt((await redis.get(requestKey)) || "0");
  // if requested for more than 2 time then lock
  if (otpRequest >= 3) {
    await redis.set(`otp_spam_lock:${email}`, "true", "EX", 3600);
    return next(
      new ValidationError("Too many OTP requests, please try again an hour")
    );
  }
  // If not more than 2 time then increment the request count
  await redis.set(requestKey, (otpRequest + 1).toString(), "EX", 3600);
};
