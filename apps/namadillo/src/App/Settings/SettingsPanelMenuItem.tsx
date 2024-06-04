import clsx from "clsx";
import { FaChevronRight } from "react-icons/fa6";
import { Link, useLocation } from "react-router-dom";

type SettingsPanelMenuItemProps = {
  text: string;
  url: string;
};

export const SettingsPanelMenuItem = ({
  url,
  text,
}: SettingsPanelMenuItemProps): JSX.Element => {
  const location = useLocation();
  return (
    <li>
      <Link
        to={url}
        state={location.state}
        className={clsx(
          "text-white text-lg bg-neutral-900 py-8 px-6",
          "flex justify-between items-center rounded-sm",
          "transition-colors duration-150 ease-out-quad hover:text-yellow"
        )}
      >
        {text}
        <FaChevronRight />
      </Link>
    </li>
  );
};
