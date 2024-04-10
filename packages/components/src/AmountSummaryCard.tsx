import clsx from "clsx";
import { createElement } from "react";
import { twMerge } from "tailwind-merge";

type AmountSummaryCardProps = {
  as?: keyof JSX.IntrinsicElements;
  logoElement?: React.ReactNode;
  title?: React.ReactNode;
  mainAmount?: React.ReactNode;
  alternativeAmount?: React.ReactNode;
  extra?: React.ReactNode;
  callToAction: React.ReactNode;
  className?: string;
};

export const AmountSummaryCard = ({
  as = "div",
  logoElement,
  title,
  mainAmount,
  alternativeAmount,
  extra,
  callToAction,
  className = "",
}: AmountSummaryCardProps): JSX.Element => {
  return createElement(
    as,
    {
      className: twMerge(
        clsx(
          "flex flex-col gap-8 justify-between rounded-sm",
          "bg-rblack pt-5 pb-6 px-6"
        ),
        className
      ),
    },
    <>
      <header className="flex flex-col gap-3">
        {logoElement && <i className="block w-9 mx-auto">{logoElement}</i>}
        {title && (
          <div
            className={clsx(
              "text-white text-sm text-center font-medium",
              "leading-4 max-w-[140px] mx-auto"
            )}
          >
            {title}
          </div>
        )}
      </header>
      <div className="text-center mb-6">
        {mainAmount && (
          <strong className="block text-3xl text-white font-medium">
            {mainAmount}
          </strong>
        )}
        {alternativeAmount && (
          <span className="block text-base text-neutral-500 font-medium">
            {alternativeAmount}
          </span>
        )}
        {extra}
      </div>
      <footer className="flex flex-col items-center mx-auto">
        {callToAction}
      </footer>
    </>
  );
};