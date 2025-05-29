"use client";
import { navbarLinks } from "apps/user-ui/src/configs/constants";
import { pacifico } from "apps/user-ui/src/app/fonts";
import { Heart, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import { FC } from "react";
import useUser from "apps/user-ui/src/hooks/useUser";

const Navbar: FC = () => {
  const { user, isLoading } = useUser();
  return (
    <nav className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-[90%] flex justify-between align-center justify-self-center">
        <Link href="/" className="self-center decoration-slate-950 px-4 py-2">
          <span
            className={`text-3xl text-primary text-slate-900 ${pacifico.className}`}
          >
            Caffe County
          </span>
        </Link>

        <div className="flex gap-2">
          <section className="flex">
            <input
              type="text"
              className="block w-80 bg-slate-200 rounded-md my-3 p-1.5 outline-none"
              placeholder="Search Product"
            />
            {/* <button className="bg-slate-900 my-3 px-2 rounded-r-md">
            <Search className="text-slate-50" />
          </button> */}
          </section>
          <span className="flex gap-2 items-center">
            {user ? (
              <span className="flex gap-2">
                <User />
                <p>{user?.name}</p>
              </span>
            ) : (
              <Link href={"/login"}>Login</Link>
            )}
            <Link href={"/cart"} className=" relative ">
              <span className="absolute top-[-6px] right-[-4px] bg-slate-900 text-slate-50 p-1 rounded-full leading-[12px] text-xs">
                0
              </span>
              <ShoppingCart />
            </Link>
            <Link href={"/wishlist"} className="relative">
              <span className="absolute top-[-6px] right-[-4px] bg-slate-900 text-slate-50 p-1 rounded-full leading-[12px] text-xs">
                0
              </span>
              <Heart />
            </Link>
          </span>
        </div>
      </div>
      <div className="bg-white w-full">
        <div className="w-max mx-auto flex p-2 gap-6 text-lg">
          {navbarLinks.map((link) => (
            <Link href={link.route} key={link.title}>
              {link.title}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
