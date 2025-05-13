"use client";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";

interface SignupInput {
  name: string;
  email: string;
  password: string;
}

const Signup = () => {
  const [showOTPScreen, setShowOTPScreen] = useState<boolean>(false);
  const [OTP, setOTP] = useState(Array(4).fill(""));
  const [disableResend, setDisableResend] = useState<boolean>(false);
  const [secondLeftToEnable, setSecondLeftToEnable] = useState<number>(0);
  const [signupInfo, setSignupInfo] = useState<SignupInput>({
    name: "",
    email: "",
    password: "",
  });
  const ref = useRef<HTMLElement[]>([]);
  const router = useRouter();

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
  } = useForm<SignupInput>();

  // Timer countdown to resend the OTP after 60 seconds.
  const startTimer = () => {
    const timer = setInterval(() => {
      setSecondLeftToEnable((prevSeconds) => {
        if (prevSeconds <= 1) {
          clearInterval(timer);
          setDisableResend(false);
          return 0;
        }
        return prevSeconds - 1;
      });
    }, 1000);
  };

  const signupMutation = useMutation({
    mutationFn: async (data: SignupInput) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/signup`,
        {
          name: data.name,
          email: data.email,
          password: data.email,
        }
      );
      // Update the local state.
      setSignupInfo({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      return response.data;
    },
    onSuccess: () => {
      setShowOTPScreen(true);
      setDisableResend(true);
      setSecondLeftToEnable(60);
      startTimer();
    },
    onError: (error) => {
      console.log("some", error);
    },
  });

  const verifyOTPMutation = useMutation({
    mutationFn: async (otp: string) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/verify-signup`,
        {
          name: signupInfo.name,
          email: signupInfo.email,
          password: signupInfo.email,
          otp,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      router.push("/login");
    },
  });

  const submit = async (data: SignupInput) => {
    signupMutation.mutate(data);
  };

  const submitOTP = () => {
    const otp = OTP.join("");
    verifyOTPMutation.mutate(otp);
  };

  const [showPassword, setShowPassword] = useState<Boolean>(false);
  return (
    <div className="mx-auto w-full max-w-[400px] bg-white rounded-md p-4 mt-20">
      <h1 className="text-center text-2xl font-bold">Signup</h1>
      <button className="bg-main text-background mt-4 rounded-md w-full py-2">
        Singup with Google
      </button>
      <div>
        <div className="flex my-2 justify-between items-center">
          <hr className="text-subtext  w-full bg block" />
          <p className="mx-2 self-center">or</p>
          <hr className="text-subtext w-full bg block" />
        </div>
      </div>
      {!showOTPScreen ? (
        <>
          <form onSubmit={handleSubmit(submit)}>
            <div className="flex flex-col">
              <label>Name</label>
              <input
                type="text"
                className="rounded-md w-full p-2 my-2 bg-background"
                placeholder="Name"
                {...register("name", {
                  required: "Name is required!",
                })}
              />
              {errors.name && (
                <p className="text-warning">{errors.name.message}</p>
              )}
            </div>
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
            <div className="flex flex-col relative">
              <label>Password</label>
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
              {signupMutation.isPending ? "Signing up" : "Sign up"}
            </button>
          </form>
          <p className="flex justify-center">
            Already have an account?
            <Link href="/login" className="text-link ml-1">
              Login
            </Link>
          </p>
        </>
      ) : (
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
    </div>
  );
};
export default Signup;
