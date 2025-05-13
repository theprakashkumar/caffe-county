"use client";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface LoginInput {
  email: string;
  password: string;
}

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>();

  const onSubmit = (data: LoginInput) => {
    console.log(data);
  };

  const [showPassword, setShowPassword] = useState<Boolean>(false);
  return (
    <div className="mx-auto w-full max-w-[400px] bg-white rounded-md p-4 mt-20">
      <h1 className="text-center text-2xl font-bold">Login</h1>
      <h4 className="text-subtext mt-2 text-sm">
        Choose between 100+ products across many category
      </h4>
      <button className="bg-main text-background mt-4 rounded-md w-full py-2">
        Login with Google
      </button>
      <div>
        <div className="flex my-2 justify-between items-center">
          <hr className="text-subtext  w-full bg block" />
          <p className="mx-2 self-center">or</p>
          <hr className="text-subtext w-full bg block" />
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
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
        <div className="flex justify-between">
          <span>
            <input id="remember" type="checkbox" className="mr-1" />
            <label htmlFor="remember">Remember </label>
          </span>
          <Link href="forget-password" className="text-link">
            Forget Password
          </Link>
        </div>

        <button
          type="submit"
          className="bg-main text-background my-2 rounded-md w-full py-2"
        >
          Login
        </button>
        <p className="flex justify-center">
          Don't have account?
          <Link href="/signup" className="text-link ml-1">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
};
export default Login;
