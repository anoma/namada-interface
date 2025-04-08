import React from "react";
import { twMerge } from "tailwind-merge";

export type PanelProps<T extends keyof JSX.IntrinsicElements> = {
  children: React.ReactNode;
  as?: T;
  hierarchy?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  title?: React.ReactNode;
} & React.ComponentPropsWithoutRef<T>;

export const Panel = <T extends keyof JSX.IntrinsicElements = "div">({
  children,
  as,
  hierarchy = "h3",
  title,
  className,
  ...props
}: PanelProps<T>): JSX.Element => {
  return React.createElement(
    as || "div",
    {
      className: twMerge(
        "rounded-sm bg-black px-4 py-5 text-white font-medium",
        className
      ),
      ...props,
    },
    <>
      {title && React.createElement(hierarchy, { className: "mb-8" }, title)}
      {children}
    </>
  );
};
