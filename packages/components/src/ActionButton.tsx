import clsx from "clsx";
import { createElement } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const colors = {
  primary: "yellow",
  secondary: "cyan",
  black: "black",
} as const;

type HoverColor = {
  hoverColor?: keyof typeof colors;
};

const actionButton = tv({
  base: clsx(
    `group flex items-center cursor-pointer min-h-[2em] overflow-hidden text-black text-center relative`,
    `[transition:color_0.1s,background_0.5s] ease-out-circ w-full select-none justify-center font-medium`,
    `active:top-px`
  ),

  variants: {
    color: {
      primary:
        "bg-100-200 bg-gradient-to-b from-50% to-50% from-yellow to-black hover:bg-bottom hover:text-yellow",
      secondary:
        "bg-100-200 bg-no-repeat bg-gradient-to-b from-50% to-50% from-cyan to-black hover:bg-bottom hover:text-cyan",
      black:
        "bg-100-200 bg-no-repeat bg-gradient-to-b from-50% to-50% from-black to-yellow hover:bg-bottom text-yellow hover:text-black",
    },

    size: {
      xs: "px-4 py-1.5 text-sm",
      sm: "px-6 py-2.5 text-sm",
      md: "px-8 py-3 text-base",
      lg: "px-8 py-[0.825em] text-lg",
      xl: "px-10 py-5 text-xl",
    },

    borderRadius: {
      sm: "rounded-sm",
      md: "rounded-md",
      lg: "rounded-lg",
    },

    outlined: {
      true: "bg-none bg-transparent border border-current",
    },

    disabled: {
      true: clsx(
        "bg-none",
        "bg-neutral-500 text-neutral-100 cursor-auto opacity-25",
        "hover:text-neutral-100 active:top-0"
      ),
    },
  },

  compoundVariants: [
    {
      outlined: true,
      color: "primary",
      class: "text-yellow",
    },

    {
      outlined: true,
      color: "secondary",
      class: "text-cyan",
    },

    {
      outlined: true,
      color: "black",
      class: "text-black",
    },
  ],

  defaultVariants: {
    color: "primary",
    size: "md",
    borderRadius: "lg",
    outlined: false,
    disabled: false,
  },
});

type ActionButtonBaseProps = VariantProps<typeof actionButton>;

export type ActionButtonProps<HtmlTag extends keyof React.ReactHTML> = {
  as?: HtmlTag;
  icon?: React.ReactNode;
} & React.ComponentPropsWithoutRef<HtmlTag> &
  HoverColor &
  ActionButtonBaseProps;

export const ActionButton = ({
  icon,
  children,
  className,
  color,
  size,
  borderRadius,
  outlined,
  disabled,
  hoverColor,
  ...props
}: ActionButtonProps<keyof React.ReactHTML>): JSX.Element => {
  // depending on the props, we can conditionally apply a class
  const hoverColorClass =
    !disabled && !outlined && hoverColor
      ? `bg-100-200 bg-gradient-to-b from-50% to-50% from-${
          colors[color || "primary"]
        } to-${colors[hoverColor]}`
      : "";
  return createElement(
    props.as || "button",
    {
      className: actionButton({
        class: [className, hoverColorClass],
        color,
        size,
        borderRadius,
        outlined,
        disabled,
      }),
      disabled,
      ...props,
    },
    <>
      {icon && (
        <i className="flex items-center justify-center left-3 absolute top-1/2 -translate-y-1/2 w-6 z-40">
          {icon}
        </i>
      )}
      <span className="relative z-10 h-full">{children}</span>
    </>
  );
};
