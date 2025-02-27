import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

const insetLabel = tv({
  base: "rounded-sm w-fit px-4 py-1 text-neutral-450",
  variants: {
    color: {
      dark: "bg-black",
      light: "bg-[#1B1B1B]",
    },
  },
  defaultVariants: {
    color: "light",
  },
});

export const InsetLabel: React.FC<
  React.ComponentProps<"div"> & VariantProps<typeof insetLabel>
> = ({ children, className, color, ...rest }) => (
  <div className={twMerge(insetLabel({ color }), className)} {...rest}>
    {children}
  </div>
);
