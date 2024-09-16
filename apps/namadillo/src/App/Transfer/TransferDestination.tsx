import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { Chain } from "types";
import { SelectedChain } from "./SelectedChain";

type TransferDestinationProps = {
  header?: React.ReactNode;
  chain?: Chain;
  footer?: React.ReactNode;
  className?: string;
};

export const TransferDestination = ({
  header,
  footer,
  chain,
  className,
}: TransferDestinationProps): JSX.Element => {
  return (
    <div
      className={twMerge(
        clsx("relative bg-neutral-800 rounded-lg px-4 py-5", className)
      )}
    >
      {header}
      <SelectedChain chain={chain} />
      {footer}
    </div>
  );
};
