import clsx from "clsx";
import { AtomWithQueryResult } from "jotai-tanstack-query";
import { MdErrorOutline } from "react-icons/md";
import { twMerge } from "tailwind-merge";

type AtomErrorBoundaryProps = {
  result: AtomWithQueryResult | AtomWithQueryResult[];
  niceError: string;
  successIf?: boolean;
  children?: React.ReactNode;
  containerProps?: React.ComponentPropsWithoutRef<"div">;
  buttonProps?: React.ComponentPropsWithoutRef<"button">;
};

export const AtomErrorBoundary = ({
  result,
  niceError,
  containerProps,
  successIf,
  children,
  buttonProps,
}: AtomErrorBoundaryProps): JSX.Element => {
  const arrayHasErrors = (
    prev: boolean,
    current: AtomWithQueryResult
  ): boolean => prev || current.isError;

  const hasError =
    Array.isArray(result) ?
      result.reduce(arrayHasErrors, false)
    : result.isError;

  const refetchAll = (): void => {
    if (!Array.isArray(result)) {
      result.refetch();
      return;
    }
    result.forEach((r) => r.refetch());
  };

  if ((successIf === undefined || successIf) && !hasError) {
    return children as JSX.Element;
  }

  if (hasError) {
    return (
      <div
        {...containerProps}
        className={twMerge(
          clsx(
            "flex flex-col flex-1 h-full items-center justify-center",
            "text-sm text-center mx-auto py-6 px-4 gap-2"
          ),
          containerProps?.className
        )}
      >
        <i className="text-3xl text-yellow">
          <MdErrorOutline />
        </i>
        <p className="leading-none">{niceError}</p>
        <button
          className={twMerge(
            "underline transition-colors duration-300 hover:text-cyan",
            buttonProps?.className
          )}
          onClick={() => refetchAll()}
          {...buttonProps}
        >
          Try again
        </button>
      </div>
    );
  }

  return <></>;
};
