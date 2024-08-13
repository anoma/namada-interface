import clsx from "clsx";
import { twMerge } from "tailwind-merge";

type TooltipProps = {
  children: React.ReactNode;
  position?: "top" | "bottom";
} & React.ComponentPropsWithoutRef<"span">;

// Use group/tooltip class in the parent element that will trigger the Tooltip
export const Tooltip = ({
  children,
  className = "",
  position = "top",
  ...props
}: TooltipProps): JSX.Element => {
  return (
    <span
      className={twMerge(
        clsx(
          "flex bg-rblack text-xs absolute opacity-0 pointer-events-none",
          "text-white rounded-sm px-4 py-1 left-1/2 -translate-x-1/2",
          "transition-all duration-500 ease-out-expo",
          "group-hover/tooltip:visible group-hover/tooltip:opacity-100",
          "group-hover/tooltip:pointer-events-auto",
          {
            "top-0 -translate-y-1/2 group-hover/tooltip:-translate-y-full":
              position === "top",
            "bottom-0 translate-y-1/2 group-hover/tooltip:translate-y-full":
              position === "bottom",
          },
          className
        )
      )}
      {...props}
    >
      {children}
    </span>
  );
};
