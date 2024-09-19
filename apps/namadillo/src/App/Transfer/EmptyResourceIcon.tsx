import clsx from "clsx";
import { twMerge } from "tailwind-merge";
type EmptyResourceProps = { className?: string };

export const EmptyResourceIcon = ({
  className = "",
}: EmptyResourceProps): JSX.Element => {
  return (
    <i
      className={twMerge(
        clsx(
          "flex items-center justify-center aspect-square rounded-full bg-neutral-900 relative ",
          "before:h-[50%] before:w-[50%] before:bg-neutral-700 before:rounded-full group-hover:before:bg-neutral-600",
          "before:transition-colors before:duration-300",
          className
        )
      )}
    />
  );
};
