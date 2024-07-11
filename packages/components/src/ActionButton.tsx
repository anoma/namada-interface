import { Color } from "@namada/components/types";
import { getDefaultColorString } from "@namada/components/utils";
import clsx from "clsx";
import { createElement, CSSProperties } from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

const actionButtonShape = tv({
  base: clsx(
    `group relative flex items-center cursor-pointer min-h-[2em]`,
    `overflow-hidden w-full justify-center text-center font-medium relative`,
    `text-[var(--text-color)] hover:text-[var(--text-hover-color)]`,
    `before:border before:border-transparent`,
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
      true: "pointer-events-none cursor-auto opacity-25 active:top-0 text-white",
    },
    outlined: {
      true: clsx(
        "before:transition-colors before:border before:border-[var(--outline)] before:absolute",
        "before:left-0 before:top-0 before:w-full before:h-full before:z-[1000]"
      ),
    },
  },
  defaultVariants: {
    size: "md",
    borderRadius: "lg",
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
    disabled: {
      true: "before:bg-neutral-500",
    },
    noHover: {
      true: "group-hover:grid-rows-[100%_100%]",
    },
  },
});

const actionButtonText = tv({
  base: clsx(
    "relative transition-colors duration-100",
    "z-40 h-full text-center w-full"
  ),
});

export type ActionButtonProps<HtmlTag extends keyof React.ReactHTML> = {
  as?: HtmlTag;
  icon?: React.ReactNode;
  backgroundColor?: Color;
  backgroundHoverColor?: Color;
  outlineColor?: Color;
  textColor?: Color;
  textHoverColor?: Color;
} & React.ComponentPropsWithoutRef<HtmlTag> &
  VariantProps<typeof actionButtonShape> &
  VariantProps<typeof actionButtonBackground>;

export const ActionButton = ({
  icon,
  children,
  className,
  size,
  borderRadius,
  disabled,
  ...props
}: ActionButtonProps<keyof React.ReactHTML>): JSX.Element => {
  const outlineColor = props.outlineColor;
  const textColor = props.textColor || outlineColor || "black";
  const backgroundColor =
    props.backgroundColor || (props.outlineColor ? "transparent" : "yellow");
  const backgroundHoverColor =
    props.backgroundHoverColor || props.outlineColor || "black";
  const textHoverColor =
    props.textHoverColor || (props.outlineColor ? "black" : backgroundColor);

  const outlined = !!outlineColor;
  const colorString = getDefaultColorString(backgroundColor);
  const hoverString = getDefaultColorString(backgroundHoverColor);
  const textColorString = getDefaultColorString(textColor);
  const textHoverColorString = getDefaultColorString(textHoverColor);
  const outlineColorString =
    outlined ? getDefaultColorString(outlineColor) : undefined;

  return createElement(
    props.as ?? ("href" in props ? "a" : "button"),
    {
      className: twMerge(
        actionButtonShape({
          size,
          disabled,
          borderRadius,
          outlined,
        }),
        className
      ),
      style: {
        "--color": colorString,
        "--hover": hoverString,
        "--text-color": textColorString,
        "--text-hover-color": textHoverColorString,
        "--outline": outlineColorString,
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
      <span
        className={actionButtonBackground({
          disabled,
          noHover: hoverString === colorString,
        })}
      />
    </>
  );
};
