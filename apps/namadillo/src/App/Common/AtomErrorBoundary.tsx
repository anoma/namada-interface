import clsx from "clsx";
import { AtomWithQueryResult } from "jotai-tanstack-query";
import { twMerge } from "tailwind-merge";

type AtomErrorBoundaryProps = {
  result: AtomWithQueryResult;
  niceError: string;
  successIf?: boolean;
  children?: React.ReactNode;
  containerProps?: React.ComponentPropsWithoutRef<"div">;
  buttonProps?: React.ComponentPropsWithoutRef<"button">;
};

export const AtomErrorBoundary = ({
  result,
  niceError,
  children,
  successIf,
  containerProps,
  buttonProps,
}: AtomErrorBoundaryProps): JSX.Element => {
  if ((successIf === undefined || successIf) && !result.isError) {
    return children as JSX.Element;
  }

  if (result.isError) {
    return (
      <div
        {...containerProps}
        className={twMerge(
          clsx("text-sm text-center"),
          containerProps?.className
        )}
      >
        <p>{niceError}</p>
        <button
          className={twMerge("underline", buttonProps?.className)}
          onClick={() => result.refetch()}
          {...buttonProps}
        >
          Try again
        </button>
      </div>
    );
  }

  return <></>;
};
