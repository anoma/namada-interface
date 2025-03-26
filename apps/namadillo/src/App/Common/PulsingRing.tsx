import anime from "animejs";
import clsx from "clsx";
import { useScope } from "hooks/useScope";
import { useRef } from "react";
import { twMerge } from "tailwind-merge";

type PulsingRingProps = { className?: string };

export const PulsingRing = ({ className }: PulsingRingProps): JSX.Element => {
  const containerRef = useRef<HTMLDivElement>(null);

  useScope(
    (query) => {
      const items = Array.from(query("[data-animation=ring]"));

      const timeline = anime.timeline({
        easing: "easeOutExpo",
        duration: 800,
        loop: true,
      });

      timeline.add({
        targets: items,
        duration: 0,
        translateY: "-50%",
        translateX: "-50%",
      });

      timeline.add({
        targets: items,
        opacity: [0, 1],
        scale: [0, 1],
        easing: "easeOutExpo",
        delay: anime.stagger(150),
        duration: 1100,
      });

      timeline.add({
        targets: items,
        opacity: 0,
        easing: "easeOutExpo",
        delay: anime.stagger(150, { direction: "reverse" }),
      });
    },
    containerRef,
    []
  );

  const renderRing = (className: string): JSX.Element => {
    return (
      <span
        data-animation="ring"
        className={clsx(
          "block absolute aspect-square border border-yellow rounded-full",
          "left-1/2 top-1/2 leading-[0]",
          className
        )}
      />
    );
  };

  return (
    <span
      ref={containerRef}
      className={twMerge("block relative leading-0", className)}
    >
      {renderRing("h-[1.8em]")}
      {renderRing("h-[3em]")}
      {renderRing("h-[4.2em]")}
    </span>
  );
};
