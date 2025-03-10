import clsx from "clsx";
import { FaChevronLeft } from "react-icons/fa6";

type BackButtonProps = {
  onClick: () => void;
};

export const BackButton = ({ onClick }: BackButtonProps): JSX.Element => (
  <button
    className={clsx(
      "inline-flex items-center",
      "text-neutral-200 px-2 py-2 -mt-2 rounded-sm",
      "hover:text-yellow"
    )}
    onClick={onClick}
  >
    <i className="text-lg">
      <FaChevronLeft />
    </i>
  </button>
);
