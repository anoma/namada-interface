import React from "react";
import { twMerge } from "tailwind-merge";

type PanelProps = {
  children: React.ReactNode;
  hierarchy?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  title?: React.ReactNode;
} & React.ComponentPropsWithoutRef<"div">;

export const Panel = ({
  children,
  hierarchy = "h3",
  title,
  className,
  ...props
}: PanelProps): JSX.Element => {
  return (
    <div
      className={twMerge(
        "rounded-sm bg-black px-4 py-5 text-white font-medium",
        className
      )}
      {...props}
    >
      {title &&
        React.createElement(
          hierarchy,
          { className: "relative z-20 mb-8" },
          title
        )}
      <div>{children}</div>
    </div>
  );
};
