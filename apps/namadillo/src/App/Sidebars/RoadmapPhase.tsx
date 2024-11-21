import clsx from "clsx";
import { FaCircleCheck } from "react-icons/fa6";

type RoadmapPhaseProps = {
  phase: string;
  active?: boolean;
  children: React.ReactNode;
};

export const RoadmapPhase = ({
  phase,
  active,
  children,
}: RoadmapPhaseProps): JSX.Element => {
  const disabledClassName = !active && "opacity-25";
  return (
    <li
      className={clsx(
        "flex flex-col items-center text-center uppercase text-yellow my-2"
      )}
    >
      <i className="w-0.5 h-3.5 bg-yellow mb-1.5" />
      <span className={clsx("block text-[13px] mb-1", disabledClassName)}>
        Phase {phase}
      </span>
      <div>{children}</div>
      {active && (
        <i className="my-1">
          <FaCircleCheck />
        </i>
      )}
    </li>
  );
};
