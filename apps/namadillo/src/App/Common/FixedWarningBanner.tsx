import { ReactNode } from "react";
import { IoWarning } from "react-icons/io5";

type FixedWarningBannerProps = {
  errorMessage: ReactNode;
};

export const FixedWarningBanner = ({
  errorMessage,
}: FixedWarningBannerProps): JSX.Element => {
  if (!errorMessage) return <></>;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-yellow z-[9999]">
      <div className="flex flex-row justify-center items-center gap-1 px-12 py-3 text-sm [&_a]:underline">
        <strong className="inline-flex items-center">
          <IoWarning /> WARNING:{" "}
        </strong>
        <div>{errorMessage}</div>
      </div>
    </div>
  );
};
