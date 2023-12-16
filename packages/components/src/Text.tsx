import { createElement } from "react";
import { twMerge } from "tailwind-merge";

type TextProps = {
  as?: keyof React.ReactHTML;
  children: React.ReactNode;
} & React.ComponentPropsWithRef<"p">;

export const Text = ({
  as: htmlTag,
  children,
  className,
  ...props
}: TextProps): JSX.Element => {
  return createElement(
    htmlTag || "p",
    {
      className: twMerge("my-[1em] text-base", className),
      ...props,
    },
    children
  );
};
