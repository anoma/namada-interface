import clsx from "clsx";
import { twMerge } from "tailwind-merge";
export type TransactionStep = {
  bullet?: boolean;
} & React.PropsWithChildren;

type TransactionTimelineProps = {
  steps: TransactionStep[];
  currentStepIndex: number;
  hasError?: boolean;
};

export const Timeline = ({
  steps,
  currentStepIndex,
  hasError,
}: TransactionTimelineProps): JSX.Element => {
  return (
    <div>
      <ul className="flex flex-col items-center gap-3">
        {steps.map((step, index: number) => {
          const disabledClassName = clsx({
            "opacity-20": index > currentStepIndex,
          });

          return (
            <li
              key={index}
              className={twMerge(
                clsx(
                  "flex flex-col gap-1 items-center text-center transition-all duration-150"
                )
              )}
            >
              {index > 0 && (
                <i
                  className={clsx(
                    "h-10 w-px bg-current mb-3",
                    disabledClassName
                  )}
                />
              )}
              {step.bullet && (
                <i
                  className={clsx(
                    "w-4 aspect-square rounded-full bg-current",
                    disabledClassName
                  )}
                />
              )}
              <div
                className={clsx("text-center", {
                  "animate-pulse": index === currentStepIndex + 1 && !hasError,
                  "opacity-20": hasError && index > currentStepIndex,
                })}
              >
                {step.children}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
