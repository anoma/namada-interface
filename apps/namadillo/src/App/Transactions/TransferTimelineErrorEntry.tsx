import clsx from "clsx";
import { GoXCircle } from "react-icons/go";

type TransferTimelineErrorEntryProps = {
  errorMessage: string;
} & React.PropsWithChildren;

export const TransferTimelineErrorEntry = ({
  errorMessage,
  children,
}: TransferTimelineErrorEntryProps): JSX.Element => {
  return (
    <>
      <i className="flex justify-center text-4xl mb-1 text-fail">
        <GoXCircle />
      </i>
      <div className="opacity-50 select-none line-through">{children}</div>
      <span
        className={clsx(
          "block text-sm text-fail selection:text-white selection:bg-fail"
        )}
      >
        {errorMessage}
      </span>
    </>
  );
};
