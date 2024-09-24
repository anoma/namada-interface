import { Color } from "@namada/components/types";
import { getDefaultColorString } from "@namada/components/utils";
import clsx from "clsx";
import { createElement, CSSProperties } from "react";
import { Link } from "react-router-dom";
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
    borderRadius: "sm",
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

type ButtonTailwindVariantsProps = VariantProps<typeof actionButtonShape> &
  VariantProps<typeof actionButtonBackground>;

export type ActionButtonProps<HtmlTag extends keyof React.ReactHTML> = {
  as?: HtmlTag;
  icon?: React.ReactNode;
  backgroundColor?: Color;
  backgroundHoverColor?: Color;
  outlineColor?: Color;
  textColor?: Color;
  textHoverColor?: Color;
} & React.ComponentPropsWithoutRef<HtmlTag> &
  Omit<ButtonTailwindVariantsProps, "noHover" | "outlined">;

const Button = ({
  icon,
  children,
  className,
  size,
  borderRadius,
  disabled,
  outlineColor,
  textColor: textColorProp,
  backgroundColor: backgroundColorProp,
  backgroundHoverColor: backgroundHoverColorProp,
  textHoverColor: textHoverColorProp,
  as = "button",
  ...domProps
}: ActionButtonProps<keyof React.ReactHTML>): JSX.Element => {
  const textColor = textColorProp || outlineColor || "black";
  const backgroundColor =
    backgroundColorProp || (outlineColor ? "transparent" : "yellow");
  const backgroundHoverColor =
    backgroundHoverColorProp || outlineColor || "black";
  const textHoverColor =
    textHoverColorProp || (outlineColor ? "black" : backgroundColor);

  const outlined = !!outlineColor;
  const colorString = getDefaultColorString(backgroundColor);
  const hoverString = getDefaultColorString(backgroundHoverColor);
  const textColorString = getDefaultColorString(textColor);
  const textHoverColorString = getDefaultColorString(textHoverColor);
  const outlineColorString =
    outlined ? getDefaultColorString(outlineColor) : undefined;

  return createElement(
    as,
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
      ...domProps,
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

export const ActionButton = <HtmlTag extends keyof React.ReactHTML>(
  props: ActionButtonProps<HtmlTag>
): JSX.Element => {
  if ("href" in props) {
    const { href, ...otherProps } = props;
    if (href) {
      if (href.startsWith("http")) {
        return <Button as="a" {...props} />;
      }
      return (
        <Link to={href}>
          <Button as="div" {...otherProps} />
        </Link>
      );
    }
  }

  return <Button {...props} />;
};
