import anime from "animejs";
import clsx from "clsx";
import { useScope } from "hooks/useScope";
import { useRef, useState } from "react";
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

const StepConnector = (): JSX.Element => (
  <i className="h-10 w-px bg-current mb-3" />
);

const StepBullet = (): JSX.Element => (
  <i className="w-4 aspect-square rounded-full bg-current" />
);

const StepContent = ({
  children,
  isCurrentStep,
  hasError,
}: React.PropsWithChildren & {
  isCurrentStep: boolean;
  hasError: boolean;
}): JSX.Element => (
  <div
    className={clsx("text-center", {
      "animate-pulse": isCurrentStep && !hasError,
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
  const [introFinished, setIntroFinished] = useState(false);

  useScope(
    (query) => {
      if (introFinished) return;
      const items = Array.from(query("i,div"));
      anime({
        targets: query("ul"),
        easing: "easeOutExpo",
        opacity: [0, 1],
        duration: 700,
        complete: () => {
          setIntroFinished(true);
        },
      });
      anime({
        targets: items,
        opacity: [0.5, 1],
        easing: "easeOutExpo",
        duration: complete ? 200 : 1000,
        delay: anime.stagger(50),
        complete: () => {
          setIntroFinished(true);
        },
      });
    },
    containerRef,
    [complete]
  );

  // Animation when transaction is complete
  useScope(
    (query, container) => {
      if (!complete || !introFinished) return;

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
    [complete, introFinished]
  );

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
      className={clsx("relative w-full", {
        "pointer-events-none": complete,
      })}
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
                  "text-center transition-all duration-150",
                  { "opacity-20": index > currentStepIndex && !hasError }
                )
              )}
            >
              {index > 0 && <StepConnector />}
              {step.bullet && <StepBullet />}
              <StepContent
                isCurrentStep={index === currentStepIndex}
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
          { hidden: !complete || !introFinished }
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
