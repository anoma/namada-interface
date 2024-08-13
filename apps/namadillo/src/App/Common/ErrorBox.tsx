import clsx from "clsx";
import { MdErrorOutline } from "react-icons/md";
import { twMerge } from "tailwind-merge";
type ErrorBoxProps = {
  containerProps?: React.ComponentPropsWithoutRef<"div">;
  niceError: React.ReactNode;
  children?: React.ReactNode;
};

export const ErrorBox = ({
  containerProps,
  niceError,
  children,
}: ErrorBoxProps): JSX.Element => {
  return (
    <div
      {...containerProps}
      className={twMerge(
        clsx(
          "flex flex-col flex-1 h-full items-center justify-center",
          "text-sm text-center mx-auto py-6 px-4 gap-3 max-w-[600px]"
        ),
        containerProps?.className
      )}
    >
      <i className="text-4xl text-yellow">
        <MdErrorOutline />
      </i>
      <div className="leading-[1.2]">{niceError}</div>
      {children}
    </div>
  );
};
