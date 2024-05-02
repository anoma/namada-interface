import { twMerge } from "tailwind-merge";

export const RoundedLabel: React.FC<React.ComponentProps<"div">> = ({
  children,
  className,
  ...rest
}) => (
  <div
    className={twMerge(
      "uppercase rounded-2xl border text-center px-2 py-1",
      className
    )}
    {...rest}
  >
    {children}
  </div>
);
