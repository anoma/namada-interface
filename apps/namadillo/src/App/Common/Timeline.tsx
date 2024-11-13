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

type DisabledProps = {
  disabled: boolean;
};

const StepConnector = ({ disabled }: DisabledProps): JSX.Element => (
  <i
    className={clsx(
      "h-10 w-px bg-current mb-3",
      clsx({ "opacity-20": disabled })
    )}
  />
);

const StepBullet = ({ disabled }: DisabledProps): JSX.Element => (
  <i
    className={clsx(
      "w-4 aspect-square rounded-full bg-current",
      clsx({ "opacity-20": disabled })
    )}
  />
);

const StepContent = ({
  children,
  isNextStep,
  hasError,
  disabled,
}: React.PropsWithChildren & {
  isNextStep: boolean;
  hasError: boolean;
  disabled: boolean;
}): JSX.Element => (
  <div
    className={clsx("text-center", {
      "animate-pulse": isNextStep && !hasError,
      "opacity-20": disabled,
    })}
  >
    {children}
  </div>
);

export const Timeline = ({
  steps,
  currentStepIndex,
  hasError,
}: TransactionTimelineProps): JSX.Element => {
  return (
    <div>
      <ul className="flex flex-col items-center gap-3">
        {steps.map((step, index: number) => {
          return (
            <li
              key={index}
              className={twMerge(
                clsx(
                  "flex flex-col gap-1 items-center",
                  "text-center transition-all duration-150"
                )
              )}
            >
              {index > 0 && (
                <StepConnector disabled={index > currentStepIndex} />
              )}
              {step.bullet && (
                <StepBullet disabled={index > currentStepIndex} />
              )}
              <StepContent
                isNextStep={index === currentStepIndex + 1 && !hasError}
                disabled={index > currentStepIndex}
                hasError={Boolean(hasError)}
              >
                {step.children}
              </StepContent>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
