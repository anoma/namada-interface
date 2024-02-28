import clsx from "clsx";
import { createElement } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const linkButton = tv({
  base: clsx(
    "relative inline-block text-base pb-1 text-center",
    "[&_button]:unset [&_button]:pointer [&_button]:text-current",
    "[&_a]:transition-all [&_a]:duration-200 [&_a]:ease-out [&_a]:text-current",
    "[&_a]:border-b [&_a]:border-transparent [&_a]:hover:border-current",
    "active:top-px"
  ),
  variants: {
    color: {
      primary: "text-yellow",
      secondary: "text-cyan",
      neutral: "text-black",
      white: "text-white",
    },
    hoverColor: {
      primary: "hover:text-yellow",
      secondary: "hover:text-cyan",
      neutral: "",
      white: "hover:text-white",
    },
    underline: {
      true: "[&_a]:border-current",
    },
  },
  defaultVariants: {
    color: "neutral",
    underline: false,
  },
});

export type LinkButtonProps = VariantProps<typeof linkButton> &
  React.ComponentPropsWithoutRef<"a">;

export const LinkButton = ({
  underline,
  color,
  children,
  hoverColor = "neutral",
  ...props
}: LinkButtonProps): JSX.Element => {
  return (
    <div className={linkButton({ color, underline, hoverColor })}>
      {createElement(props.href ? "a" : "button", { ...props }, children)}
    </div>
  );
};
