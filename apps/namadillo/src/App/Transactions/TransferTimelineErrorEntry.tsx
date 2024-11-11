import clsx from "clsx";
import { GoXCircle } from "react-icons/go";
import { TransferTransactionData } from "types";

type TransferTimelineErrorEntryProps = {
  transaction: TransferTransactionData;
} & React.PropsWithChildren;

export const TransferTimelineErrorEntry = ({
  transaction,
  children,
}: TransferTimelineErrorEntryProps): JSX.Element => {
  return (
    <>
      <i className="text-2xl mb-1 opacity-70 text-fail">
        <GoXCircle />
      </i>
      <div className="opacity-70">{children}</div>
      <span
        className={clsx(
          "block text-sm text-fail -mt-1.5 selection:text-white selection:bg-fail"
        )}
      >
        {transaction.errorMessage}
      </span>
    </>
  );
};
