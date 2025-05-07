import { pacifico } from "apps/user-ui/src/app/fonts";
import { Heart, Search, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import { FC } from "react";

const Navbar: FC = () => {
  return (
    <nav className="  sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-1">
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
              className="block w-64 border border-slate-600 rounded-l-md my-2 p-2 "
            />
            <button className="bg-slate-900 my-2 px-2 rounded-r-md">
              <Search className="text-slate-50" />
            </button>
          </section>

          <span className="flex gap-2 items-center">
            <span className="flex gap-2 ml-4">
              <User />
              <p>Login</p>
            </span>
            <Link href={"/cart"} className="ml-4">
              <ShoppingCart />
            </Link>
            <Link href={"/wishlist"}>
              <Heart />
            </Link>
          </span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
