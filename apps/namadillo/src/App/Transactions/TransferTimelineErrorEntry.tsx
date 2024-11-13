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
      <i className="flex justify-center text-2xl mb-1 opacity-70 text-fail">
        <GoXCircle />
      </i>
      <div className="opacity-70">{children}</div>
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
