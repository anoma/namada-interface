import { twMerge } from "tailwind-merge";

type Props = {
  children: React.ReactNode;
  icon?: React.ReactNode;
} & React.ComponentPropsWithoutRef<"span">;

export const Badge = ({
  children,
  className,
  icon,
  ...props
}: Props): JSX.Element => {
  return (
    <span
      className={twMerge(
        "flex gap-2 text-xxs items-center font-bold rounded-sm px-3 py-1 leading-4",
        className
      )}
      {...props}
    >
      {icon && <i className="-ml-2 w-4 text-base">{icon}</i>}
      {children}
    </span>
  );
};
