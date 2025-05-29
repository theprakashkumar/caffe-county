"use client";
import { useMutation } from "@tanstack/react-query";
import { countries } from "apps/seller-ui/src/config/constant";
import CreateShop from "apps/seller-ui/src/shared/modules/auth/CreateShop";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";

interface SignupInput {
  name: string;
  email: string;
  phone: number | string | null;
  country: string;
  password: string;
}

const Signup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [sellerId, setSellerId] = useState("");
  const [showOTPScreen, setShowOTPScreen] = useState<boolean>(false);
  const [OTP, setOTP] = useState(Array(4).fill(""));
  const [disableResend, setDisableResend] = useState<boolean>(false);
  const [secondLeftToEnable, setSecondLeftToEnable] = useState<number>(0);
  const [signupInfo, setSignupInfo] = useState<SignupInput>({
    name: "",
    email: "",
    phone: null,
    country: "",
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
  } = useForm<SignupInput>({
    defaultValues: {
      name: "PK",
      email: "supertechieyt@gmail.com",
      phone: "9876543210",
      country: "GB",
      password: "1234567890",
    },
  });

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
        `${process.env.NEXT_PUBLIC_BASE_URL}/seller-registration`,
        data
      );

      return response.data;
    },
    onSuccess: (_, formData) => {
      // Update the local state.
      // data in mutationFn can be found in second argument here
      setSignupInfo(formData);
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
        `${process.env.NEXT_PUBLIC_BASE_URL}/verify-seller`,
        {
          name: signupInfo.name,
          email: signupInfo.email,
          password: signupInfo.password,
          phone: signupInfo.phone,
          country: signupInfo.country,
          otp,
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      setSellerId(data?.seller?.id);
      setCurrentStep(2);
    },
  });

  const submit = async (data: SignupInput) => {
    signupMutation.mutate(data);
  };

  const submitOTP = () => {
    const otp = OTP.join("");
    verifyOTPMutation.mutate(otp);
  };

  const connectStripe = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/create-stripe-link`,
        { sellerId }
      );

      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error: any) {
      console.error("Simple Connection Error:", error);
    }
  };

  const [showPassword, setShowPassword] = useState<Boolean>(false);
  return (
    <>
      <div className="max-w-[480px] flex mx-auto justify-between items-center py-10 gap-2">
        {[1, 2, 3].map((element) => {
          return element !== 3 ? (
            <>
              <div
                className={`w-5 h-5 bg-main rounded-full text-white flex justify-center items-center text-xs ${
                  element < currentStep && "bg-success"
                }`}
              >
                {element}
              </div>
              <div
                className={`h-0.5 bg-black flex-1 ${
                  element < currentStep && "bg-success"
                }`}
              ></div>
            </>
          ) : (
            <div className="w-5 h-5 bg-main rounded-full text-white flex justify-center items-center text-xs">
              {element}
            </div>
          );
        })}
      </div>

      {currentStep === 1 && (
        <div className="mx-auto w-full max-w-[400px] bg-white rounded-md p-4">
          <h1 className="text-center text-2xl font-bold">Signup</h1>

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
                    type="email"
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
                <div className="flex flex-col">
                  <label>Phone</label>
                  <input
                    type="tel"
                    className="rounded-md w-full p-2 my-2 bg-background"
                    placeholder="Phone"
                    {...register("phone", {
                      required: "Phone is required!",
                      pattern: {
                        value: /^\+?[0-9]{10,15}$/,
                        message: "Please enter a valid phone!",
                      },
                      minLength: {
                        value: 10,
                        message: "Phone number should be of 10 digits!",
                      },
                    })}
                  />
                  {errors.phone && (
                    <p className="text-warning">{errors.phone.message}</p>
                  )}
                </div>
                <div className="flex flex-col">
                  <label>Country</label>
                  <select
                    className="rounded-md w-full p-2 my-2 bg-background"
                    {...register("country", {
                      required: "Country is required!",
                    })}
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select country
                    </option>
                    {countries.map((country) => (
                      <option
                        key={country.code}
                        value={country.code}
                      >{`${country.flag} ${country.name}`}</option>
                    ))}
                  </select>
                  {errors.country && (
                    <p className="text-warning">{errors.country.message}</p>
                  )}
                  {errors.phone && (
                    <p className="text-warning">{errors.phone.message}</p>
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
      )}

      {currentStep === 2 && (
        <CreateShop sellerId={sellerId} setActiveState={setCurrentStep} />
      )}

      {currentStep === 3 && (
        <div className="mx-auto w-full max-w-[400px] bg-white rounded-md p-4">
          <h1 className="text-center text-2xl font-bold">Connect Payment</h1>
          <br />
          <button
            type="submit"
            className="bg-main text-background my-2 rounded-md w-full py-2"
            onClick={connectStripe}
          >
            Connect Strip
          </button>
        </div>
      )}
    </>
  );
};
export default Signup;
