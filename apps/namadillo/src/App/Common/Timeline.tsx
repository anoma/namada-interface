import anime from "animejs";
import clsx from "clsx";
import { useScope } from "hooks/useScope";
import { useLayoutEffect, useRef } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { twMerge } from "tailwind-merge";
export type TransactionStep = {
  bullet?: boolean;
} & React.PropsWithChildren;

type TransactionTimelineProps = {
  steps: TransactionStep[];
  currentStepIndex: number;
  hasError?: boolean;
  complete?: boolean;
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
  isCurrentStep,
  hasError,
  disabled,
}: React.PropsWithChildren & {
  isCurrentStep: boolean;
  hasError: boolean;
  disabled: boolean;
}): JSX.Element => (
  <div
    className={clsx("text-center", {
      "animate-pulse": isCurrentStep && !hasError,
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
  complete,
}: TransactionTimelineProps): JSX.Element => {
  const containerRef = useRef<HTMLDivElement>(null);

  useScope(
    (query, container) => {
      if (!complete) return;

      const timeline = anime.timeline({
        easing: "easeOutExpo",
        duration: 1000,
      });

      const containerRect = container.getBoundingClientRect();
      const items = Array.from(query("i,div"));
      const hiding = items.slice(0, -1);
      const lastItem = items.slice(-1)[0];
      const lastItemText = lastItem.querySelector("p");
      const rings = query('[data-animation="ring"]');
      const confirmation = query('[data-animation="confirmation"]');

      const lastItemTextHeight =
        lastItemText ? lastItemText.getBoundingClientRect().height : 0;

      const marginTop = 4; // ?

      const centerLastItemY =
        -containerRect.height / 2 +
        lastItem.getBoundingClientRect().height / 2 +
        lastItemTextHeight / 2 +
        marginTop;

      // Hide items, except last one
      timeline.add({
        targets: hiding,
        opacity: 0,
        delay: anime.stagger(30),
      });

      // Move last item to the center of the screen
      timeline.add(
        {
          targets: lastItem,
          translateY: centerLastItemY,
        },
        "-=700"
      );

      // Try to hide any existing text contained on the last item, as soon
      // as the item goes up
      timeline.add(
        {
          targets: lastItem.querySelector("p"),
          opacity: 0,
          duration: 400,
        },
        "-=1000"
      );

      // Display concentric rings, one by one
      timeline.add(
        {
          targets: rings,
          opacity: [0, 1],
          duration: 800,
          scale: [0, 1],
          delay: anime.stagger(100),
        },
        "-=600"
      );

      // Sucks everything into the screen
      timeline.add({
        targets: [...rings, lastItem],
        scale: 0,
        duration: 300,
      });

      // Displays success box confirmation
      timeline.add({
        targets: confirmation,
        duration: 1000,
        scale: [0, 1],
        opacity: [0, 1],
      });
    },
    containerRef,
    [complete]
  );

  useLayoutEffect(() => {
    if (!containerRef.current) return;
  }, []);

  const renderRing = (className: string): JSX.Element => (
    <span
      data-animation="ring"
      className={clsx(
        "absolute aspect-square border-2 border-yellow rounded-full",
        className
      )}
    />
  );

  return (
    <div
      className={clsx("relative", { "pointer-events-none": complete })}
      ref={containerRef}
    >
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
                isCurrentStep={index === currentStepIndex}
                disabled={index > currentStepIndex}
                hasError={!!hasError}
              >
                {step.children}
              </StepContent>
            </li>
          );
        })}
      </ul>
      <span
        className={clsx(
          "absolute w-full h-full circles top-0 left-0",
          "flex items-center justify-center pointer-events-none",
          { hidden: !complete }
        )}
      >
        {renderRing("h-30")}
        {renderRing("h-60")}
        {renderRing("h-96")}
        <span
          data-animation="confirmation"
          className={clsx(
            "absolute text-success text-[70px] aspect-square bg-white rounded-full",
            { "opacity-0": complete }
          )}
        >
          <FaCheckCircle />
        </span>
      </span>
    </div>
  );
};
