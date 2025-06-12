import SideBarWrapper from "apps/seller-ui/src/shared/components/sidebar/SideBarWrapper";
import Link from "next/link";
import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="mx-auto h-[100vh] flex">
      <aside className="w-[280px] border-r border-slate-800">
        <Link href={"/home"} className="p-4 block  text-lg">
          User Name
        </Link>
        <SideBarWrapper />
      </aside>
      <main className="bg-gray-50">{children}</main>
    </div>
  );
};

export default Layout;
