import clsx from "clsx";
import React from "react";
import { GoXCircle } from "react-icons/go";

type InlineErrorProps = {
  errorMessage?: React.ReactNode;
};

export const InlineError = ({
  errorMessage,
}: InlineErrorProps): JSX.Element => {
  if (!errorMessage) return <></>;
  return (
    <div
      className={clsx(
        "text-fail text-sm flex items-center gap-1.5 selection:bg-fail selection:text-black"
      )}
    >
      <GoXCircle />
      {errorMessage}
    </div>
  );
};
