import { Children, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export const OpacitySlides = ({
  children,
  activeIndex,
}: {
  children: ReactNode;
  activeIndex: number;
}): JSX.Element => {
  return (
    <>
      {Children.map(children, (child, index) => (
        <div
          key={index}
          className={twMerge(
            "absolute transition-all duration-500",
            index === activeIndex ?
              "opacity-1 pointer-events-auto"
            : "opacity-0 pointer-events-none"
          )}
        >
          {child}
        </div>
      ))}
    </>
  );
};
