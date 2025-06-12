// This will have collection of SideBarMenuItem which is a link.
interface Props {
  title: string;
  children: React.ReactNode;
}

const SideBarMenu = ({ title, children }: Props) => {
  return (
    <div>
      <h3 className="text-main">{title}</h3>
      {children}
    </div>
  );
};

export default SideBarMenu;
