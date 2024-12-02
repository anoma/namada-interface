import clsx from "clsx";
import { twMerge } from "tailwind-merge";

type ShieldAllContainerProps = React.PropsWithChildren<
  React.ComponentPropsWithoutRef<"div">
>;

export const ShieldAllContainer = ({
  children,
  className,
  ...props
}: ShieldAllContainerProps): JSX.Element => {
  return (
    <section
      className={twMerge(
        clsx(
          "flex flex-col bg-yellow text-black py-8 px-12",
          "w-full max-w-[590px] min-h-[600px] mx-auto rounded-md"
        ),
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
};
