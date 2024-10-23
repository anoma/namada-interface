import clsx from "clsx";
import { twMerge } from "tailwind-merge";
type TransasctionStep = {
  children: React.ReactNode;
  bullet?: boolean;
};

type TransactionTimelineProps = {
  steps: TransasctionStep[];
  currentStepIndex: number;
  isShielded?: boolean;
};

export const TransactionTimeline = ({
  steps,
  currentStepIndex,
  isShielded,
}: TransactionTimelineProps): JSX.Element => {
  return (
    <div>
      <ul className="flex flex-col items-center gap-3">
        {steps.map((step, index: number) => (
          <li
            key={index}
            className={twMerge(
              clsx(
                "flex flex-col gap-1 items-center text-center transition-all duration-150",
                {
                  "opacity-20": index > currentStepIndex,
                  "text-white": !isShielded,
                }
              )
            )}
          >
            {index > 0 && <i className="h-12 w-px bg-white mb-3" />}
            {step.bullet && (
              <i className="w-4 aspect-square rounded-full bg-current" />
            )}
            {step.children}
          </li>
        ))}
      </ul>
    </div>
  );
};
