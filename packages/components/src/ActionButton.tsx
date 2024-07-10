import { Color } from "@namada/components/types";
import { getDefaultColorString } from "@namada/components/utils";
import clsx from "clsx";
import { createElement, CSSProperties } from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

const actionButtonShape = tv({
  base: clsx(
    `group relative flex items-center cursor-pointer min-h-[2em]`,
    `border-transparent border overflow-hidden w-full justify-center text-center relative`,
    `border-none outline-0 active:top-px`
  ),
  variants: {
    size: {
      xs: "px-4 py-1.5 text-sm leading-none",
      sm: "px-6 py-2.5 text-sm",
      md: "px-8 py-3 text-base",
      lg: "px-8 py-[0.825em] text-lg",
      xl: "px-10 py-5 text-xl",
    },
    borderRadius: {
      sm: "rounded-sm before:rounded-sm",
      md: "rounded-md before:rounded-md",
      lg: "rounded-lg before:rounded-lg",
    },
    disabled: {
      true: "cursor-auto opacity-25 active:top-0",
    },
    outlined: {
      true: clsx(
        "text-[var(--color)] before:border-current before:border-[var(--color)] before:absolute",
        "before:left-0 before:top-0 before:w-full before:h-full before:z-[1000]"
      ),
    },
  },
});

const actionButtonBackground = tv({
  base: clsx(
    "absolute left-0 top-0 w-full h-full z-10 w-full overflow-hidden",
    "grid grid-rows-[100%_100%] group-hover:grid-rows-[0%_100%]",
    "before:bg-[var(--color)] after:bg-[var(--hover)]",
    "transition-all duration-[0.5s] ease-[var(--ease-out-circ)]"
  ),
  variants: {
    outlined: {
      true: "before:!bg-transparent",
    },
  },
});

const actionButtonText = tv({
  base: clsx(
    "relative font-medium transition-colors duration-100",
    "text-black z-40 h-full text-center w-full group-hover:text-[var(--color)]"
  ),
});

export type ActionButtonProps<HtmlTag extends keyof React.ReactHTML> = {
  as?: HtmlTag;
  icon?: React.ReactNode;
  color?: Color;
  hoverColor?: Color;
} & React.ComponentPropsWithoutRef<HtmlTag> &
  VariantProps<typeof actionButtonShape> &
  VariantProps<typeof actionButtonBackground>;

export const ActionButton = ({
  icon,
  children,
  className,
  size,
  borderRadius,
  outlined,
  disabled,
  color = "yellow",
  hoverColor = "black",
  ...props
}: ActionButtonProps<keyof React.ReactHTML>): JSX.Element => {
  const colorString = getDefaultColorString(color || "yellow");
  const hoverString = getDefaultColorString(hoverColor || "black");
  return createElement(
    props.as ?? ("href" in props ? "a" : "button"),
    {
      className: twMerge(
        actionButtonShape({ size, disabled, outlined, borderRadius }),
        className
      ),
      style: {
        "--color": colorString,
        "--hover": hoverString,
      } as CSSProperties,
      disabled,
      ...props,
    },
    <>
      {icon && (
        <i className="flex items-center justify-center left-3 absolute top-1/2 -translate-y-1/2 w-6 z-40">
          {icon}
        </i>
      )}
      <span className={actionButtonText()}>{children}</span>
      <span className={actionButtonBackground({ outlined })} />
    </>
  );
};
