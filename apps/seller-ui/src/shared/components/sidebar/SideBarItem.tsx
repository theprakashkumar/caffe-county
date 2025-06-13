import Link from "next/link";

interface Props {
  title: string;
  icon: React.ReactNode;
  isActive?: boolean;
  href: string;
}
const SideBarItem = ({ title, icon, isActive, href }: Props) => {
  return (
    <Link
      href={href}
      className={`flex gap-2 items-center p-2 hover:bg-slate-100 ${
        isActive && "bg-slate-100"
      }`}
    >
      {icon}
      <h5 className="text-lg text-main">{title}</h5>
    </Link>
  );
};
export default SideBarItem;
