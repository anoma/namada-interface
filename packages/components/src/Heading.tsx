import { createElement } from "react";
import { tv } from "tailwind-variants";

const heading = tv({
  base: "m-0 p-0 text-balance font-medium",
  variants: {},
});

type HeadingProps = {
  level?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  className?: string;
  children: React.ReactNode;
};

export const Heading = ({
  level = "h1",
  className = "",
  children,
}: HeadingProps): JSX.Element => {
  return createElement(
    level,
    { className: heading({ class: className }) },
    children
  );
};
