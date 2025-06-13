"use client";
import useSeller from "apps/seller-ui/src/app/hooks/useSeller";
import useSidebar from "apps/seller-ui/src/app/hooks/useSidebar";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import SideBarMenu from "./SideBarMenu";
import SideBarItem from "./SideBarItem";
import {
  BadgePlus,
  BellPlus,
  BellRing,
  Box,
  CalendarPlus,
  ListOrdered,
  LogOut,
  Mail,
  Settings,
  Wallet,
} from "lucide-react";

const SideBarWrapper = () => {
  const { currentActiveLink, setCurrentActiveLink } = useSidebar();
  const pathName = usePathname();
  const { seller } = useSeller();

  console.log(pathName);

  // Update the active side bar link based on pathname
  useEffect(() => {
    setCurrentActiveLink(pathName);
  }, [pathName, setCurrentActiveLink]);
  return (
    <div className="text-white px-2">
      <SideBarMenu title="Main Menu">
        <SideBarItem
          title="Order"
          href="/dashboard/order"
          icon={<ListOrdered className="text-main" />}
          isActive={currentActiveLink === "/dashboard/order"}
        />
        <SideBarItem
          title="Payments"
          href="/dashboard/payments"
          icon={<Wallet className="text-main" />}
          isActive={currentActiveLink === "/dashboard/payments"}
        />
      </SideBarMenu>
      <SideBarMenu title="Products">
        <SideBarItem
          title="Create Product"
          href="/dashboard/create-product"
          icon={<BadgePlus className="text-main" />}
          isActive={currentActiveLink === "/dashboard/create-product"}
        />
        <SideBarItem
          title="All Products"
          href="/dashboard/all-products"
          icon={<Box className="text-main" />}
          isActive={currentActiveLink === "/dashboard/all-products"}
        />
      </SideBarMenu>
      <SideBarMenu title="Events">
        <SideBarItem
          title="Create Events"
          href="/dashboard/create-events"
          icon={<CalendarPlus className="text-main" />}
          isActive={currentActiveLink === "/dashboard/create-events"}
        />
        <SideBarItem
          title="All Events"
          href="/dashboard/all-events"
          icon={<BellRing className="text-main" />}
          isActive={currentActiveLink === "/dashboard/all-events"}
        />
      </SideBarMenu>
      <SideBarMenu title="Controller">
        <SideBarItem
          title="Create Inbox"
          href="/dashboard/inbox"
          icon={<Mail className="text-main" />}
          isActive={currentActiveLink === "/dashboard/inbox"}
        />
        <SideBarItem
          title="Setting"
          href="/dashboard/setting"
          icon={<Settings className="text-main" />}
          isActive={currentActiveLink === "/dashboard/setting"}
        />
        <SideBarItem
          title="Notification"
          href="/dashboard/notification"
          icon={<BellPlus className="text-main" />}
          isActive={currentActiveLink === "/dashboard/notification"}
        />
      </SideBarMenu>
      <SideBarMenu title="Extra">
        <SideBarItem
          title="Logout"
          href="/dashboard/inbox"
          icon={<LogOut className="text-main" />}
          isActive={currentActiveLink === "/dashboard/inbox"}
        />
      </SideBarMenu>
    </div>
  );
};

export default SideBarWrapper;
