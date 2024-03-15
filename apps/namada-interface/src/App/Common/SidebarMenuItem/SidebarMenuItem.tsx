import clsx from "clsx";
import { NavLink } from "react-router-dom";

type Props = {
  url: string;
  children: React.ReactNode;
};

export const SidebarMenuItem = ({ url, children }: Props): JSX.Element => {
  return (
    <NavLink
      to={url}
      className={({ isActive }) =>
        clsx(
          "flex items-center gap-5 text-lg text-white",
          "transition-colors duration-300 ease-out-quad hover:text-cyan",
          {
            "text-yellow font-bold": isActive,
          }
        )
      }
    >
      {children}
    </NavLink>
  );
};
