import clsx from "clsx";
import { createElement } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const actionButton = tv({
  base: clsx(
    `group flex items-center cursor-pointer min-h-[2em] overflow-hidden text-black text-center relative`,
    `transition-colors duration-100 w-full select-none justify-center font-medium`,
    `active:top-px`
  ),

  variants: {
    color: {
      primary: "bg-yellow hover:text-yellow",
      secondary: "bg-cyan hover:text-cyan",
      black: "bg-black text-yellow hover:text-black",
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
      true: "bg-transparent border border-current",
    },

    disabled: {
      true: clsx(
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

const actionButtonHover = tv({
  base: clsx(
    "block absolute h-full w-full left-0 top-0 origin-center translate-y-[calc(100%+2px)]",
    "transition-all ease-out-circ duration-[0.5s] group-hover:translate-y-0"
  ),
  variants: {
    hoverColor: {
      primary: "bg-yellow",
      secondary: "bg-cyan",
      black: "bg-black",
    },
    disabled: {
      true: "group-hover:translate-y-[calc(100%+2px)]",
    },
  },

  defaultVariants: {
    hoverColor: "black",
  },
});

type ActionButtonBaseProps = VariantProps<typeof actionButton>;
type ActionButtonHoverBaseProps = VariantProps<typeof actionButtonHover>;
export type ActionButtonProps<HtmlTag extends keyof React.ReactHTML> = {
  as?: HtmlTag;
  icon?: React.ReactNode;
} & React.ComponentPropsWithoutRef<HtmlTag> &
  ActionButtonBaseProps &
  ActionButtonHoverBaseProps;

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
  return createElement(
    props.as || "button",
    {
      className: actionButton({
        class: className,
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
      <i className={actionButtonHover({ hoverColor, disabled })} />
    </>
  );
};
