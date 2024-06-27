import { AtomWithQueryResult } from "jotai-tanstack-query";
import { twMerge } from "tailwind-merge";
import { ErrorBox } from "./ErrorBox";

type AtomErrorBoundaryProps = {
  result: AtomWithQueryResult | AtomWithQueryResult[];
  niceError: React.ReactNode;
  children?: React.ReactNode;
  containerProps?: React.ComponentPropsWithoutRef<"div">;
  buttonProps?: React.ComponentPropsWithoutRef<"button">;
};

export const AtomErrorBoundary = ({
  result,
  niceError,
  containerProps,
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

  if (hasError) {
    return (
      <ErrorBox niceError={niceError} containerProps={containerProps}>
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
      </ErrorBox>
    );
  }

  return children as JSX.Element;
};
