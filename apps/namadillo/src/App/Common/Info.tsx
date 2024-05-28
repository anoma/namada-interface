import clsx from "clsx";
import React from "react";
import { GoInfo } from "react-icons/go";
import { twMerge } from "tailwind-merge";

type InfoProps = React.ComponentPropsWithRef<"span">;

export const Info = (props: InfoProps): JSX.Element => {
  const { className, children, ...rest } = props;
  return (
    <i
      className={twMerge("group inline-flex cursor-pointer", className)}
      {...rest}
    >
      <GoInfo />
      <span
        className={clsx(
          "text-sm hidden group-hover:block absolute top-[3em]",
          "bg-neutral-800 border-neultra-700 border rounded-sm",
          "w-[70%] z-50 left-1/2 -translate-x-1/2 not-italic px-14 py-3"
        )}
      >
        {children}
      </span>
    </i>
  );
};
