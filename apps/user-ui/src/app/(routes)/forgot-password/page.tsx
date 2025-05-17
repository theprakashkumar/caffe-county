"use client";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";

interface ForgotPasswordData {
  email: string;
  password: string;
}
type CurrentScreen = "email" | "password" | "OTP";
const ForgotPassword: React.FC = () => {
  const router = useRouter();
  const [currentScreen, setCurrentScreen] = useState<CurrentScreen>("email");
  const [OTP, setOTP] = useState(Array(4).fill(""));
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [disableResend, setDisableResend] = useState<boolean>(false);
  const [secondLeftToEnable, setSecondLeftToEnable] = useState();
  const [serverError, setServerError] = useState<string | null>("");
  const [userDetails, setUserDetails] = useState({
    email: "",
    password: "",
  });
  const ref = useRef<HTMLElement[]>([]);

  const handleOTPChange = (e: any, index: number) => {
    const inputtedKey = e.key;
    let previousOTP = [...OTP];

    if (inputtedKey === "Backspace") {
      previousOTP[index] = "";
      setOTP(previousOTP);
      // Move to previous input.
      if (index > 0) {
        ref.current[index - 1].focus();
      }
      return;
    }
    // If value is not a number then don't store in state.
    if (isNaN(inputtedKey)) return;

    previousOTP[index] = inputtedKey;
    setOTP(previousOTP);
    // Move to next input.
    if (index + 1 < OTP.length) {
      ref.current[index + 1].focus();
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordData>();

  const requestOTPMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`,
        {
          email,
        }
      );
      return response.data;
    },
    onSuccess: (_, email) => {
      setCurrentScreen("OTP");
      setUserDetails((userDetails) => ({ ...userDetails, email }));
      setServerError(null);
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response!.data as { message?: string })?.message ||
        "Something went wrong!";
      setServerError(errorMessage);
    },
  });

  const verifyOTPMutation = useMutation({
    mutationFn: async (data: { email: string; otp: string }) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/verify-reset-password`,
        {
          email: data.email,
          otp: data.otp,
        }
      );
      return response.data;
    },
    onSuccess: (_, data) => {
      setCurrentScreen("password");
      setUserDetails((userDetails) => ({ ...userDetails, otp: data.otp }));
      setServerError(null);
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response!.data as { message?: string })?.message ||
        "Something went wrong!";
      setServerError(errorMessage);
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: {
      email: string;
      otp: string;
      password: string;
    }) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/update-password`,
        {
          email: data.email,
          otp: data.otp,
          password: data.password,
        }
      );

      return response.data;
    },
    onSuccess: () => {
      router.push("/");
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response!.data as { message?: string })?.message ||
        "Something went wrong!";
      setServerError(errorMessage);
    },
  });

  const submitEmail = (data: ForgotPasswordData) => {
    requestOTPMutation.mutate(data.email);
  };

  const submitOTP = () => {
    const otp: string = OTP.join("");
    verifyOTPMutation.mutate({ email: userDetails.email, otp });
  };

  const handleRestPassword = (data: ForgotPasswordData) => {
    updatePasswordMutation.mutate({ ...data, otp: OTP.join("") });
  };

  return (
    <div className="mx-auto w-full max-w-[400px] bg-white rounded-md p-4 mt-20">
      <p>
        {userDetails.email}
        {userDetails.password}
      </p>
      <h1 className="text-center text-2xl font-bold">Forgot Password</h1>
      {currentScreen === "email" && (
        <>
          <h2 className="text-center text-lg text-subtext mt-2">
            Enter email to get OTP.
          </h2>
          <form onSubmit={handleSubmit(submitEmail)}>
            <div className="flex flex-col">
              <label>Email</label>
              <input
                type="text"
                className="rounded-md w-full p-2 my-2 bg-background"
                placeholder="Email"
                {...register("email", {
                  required: "Email is required!",
                  pattern: {
                    value: /^[^@ ]+@[^@ ]+.[^@ .]{2,}$/,
                    message: "Please enter a valid email!",
                  },
                })}
              />
              {errors.email && (
                <p className="text-warning">{errors.email.message}</p>
              )}
            </div>
            <button
              type="submit"
              className="bg-main text-background my-2 rounded-md w-full py-2"
              disabled={requestOTPMutation.isPending}
            >
              {requestOTPMutation.isPending
                ? "Reset Password..."
                : "Reset Password"}
            </button>
          </form>
        </>
      )}
      {currentScreen === "OTP" && (
        <>
          <h2 className="text-center mb-2">Enter the OTP sent to email</h2>
          <div className="flex gap-2 w-fit mx-auto">
            {OTP.map((item, index) => (
              <input
                key={index}
                type="text"
                ref={(currentInput) => {
                  if (currentInput) {
                    ref.current[index] = currentInput;
                  }
                }}
                value={item}
                onKeyDown={(e) => handleOTPChange(e, index)}
                className="w-10 h-10 bg-background text-center"
                readOnly
              />
            ))}
          </div>
          <button
            className="bg-main text-background mt-4 rounded-md w-full py-2"
            onClick={submitOTP}
          >
            Submit
          </button>
          <button
            className="block mt-2 mx-auto w-fit text-link disabled:cursor-not-allowed"
            disabled={disableResend}
          >
            {disableResend ? `Resend in ${secondLeftToEnable}` : "Resend"}
          </button>
        </>
      )}

      {currentScreen === "password" && (
        <>
          <h2 className="text-center mb-2">Enter new password</h2>
          <form onSubmit={handleSubmit(handleRestPassword)}>
            <div className="flex flex-col relative">
              <label>New Password</label>
              <input
                type={showPassword ? "text" : "password"}
                className="rounded-md w-full p-2 my-2 bg-background pr-10"
                placeholder="Password"
                {...register("password", {
                  required: "Password is required!",
                })}
              />
              {errors.password && (
                <p className="text-warning">{errors.password.message}</p>
              )}
              <button
                className="absolute top-10 right-2"
                onClick={(e) => {
                  e.preventDefault();
                  setShowPassword((showPassword) => !showPassword);
                }}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            <button
              type="submit"
              className="bg-main text-background my-2 rounded-md w-full py-2"
            >
              Reset Password
            </button>
            <p className="flex justify-center">
              <Link href="/login" className="text-link mr-1">
                Login
              </Link>
              Instead?
            </p>
          </form>
        </>
      )}
      <p className="text-warning">{serverError}</p>
    </div>
  );
};

export default ForgotPassword;
