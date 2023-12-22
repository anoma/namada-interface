import { createElement } from "react";
import { tv } from "tailwind-variants";

type StackProps<T extends keyof JSX.IntrinsicElements> = {
  children: React.ReactNode;
  gap: "px" | number;
  direction?: "vertical" | "horizontal";
  as?: T;
  full?: boolean;
};

export enum GapPatterns {
  TitleContent = 8,
  FormFields = 5,
}

const stack = tv({
  base: "flex list-none p-0 m-0",
  variants: {
    full: {
      true: "h-full flex-1",
    },
    direction: {
      vertical: "flex-col",
      horizontal: "flex-row",
    },
  },
});

const calculateGap = (gap: "px" | number): string => {
  if (gap === "px") return "1px";
  return gap * 4 + "px";
};

export const Stack = <T extends keyof JSX.IntrinsicElements>({
  children,
  gap = 4,
  direction = "vertical",
  className,
  full = false,
  ...props
}: StackProps<T> & React.ComponentPropsWithoutRef<T>): JSX.Element => {
  return createElement(
    (props.as as keyof React.ReactHTML) || "div",
    {
      className: stack({ direction, full, class: className }),
      style: { gap: calculateGap(gap) },
      ...props,
    },
    children
  );
};
