import clsx from "clsx";

export const TextLink: React.FC<React.ComponentProps<"div">> = ({
  className,
  children,
  ...rest
}) => (
  <span className={clsx("underline cursor-pointer", className)} {...rest}>
    {children}
  </span>
);
