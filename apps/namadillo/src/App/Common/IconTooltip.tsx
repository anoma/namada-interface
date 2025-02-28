import { Tooltip } from "@namada/components";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

type IconTooltipProps = {
  icon: React.ReactNode;
  text: React.ReactNode;
  className?: string;
  tooltipClassName?: string;
};

export const IconTooltip = ({
  icon,
  text,
  className,
  tooltipClassName,
}: IconTooltipProps): JSX.Element => {
  return (
    <i
      className={twMerge(
        clsx(
          "group/tooltip bg-neutral-600 inline-flex not-italic text-[8px]",
          "w-3.5 h-3.5 rounded-full items-center justify-center",
          className
        )
      )}
    >
      {icon}
      <Tooltip className={twMerge(clsx("z-50 w-68", tooltipClassName))}>
        {text}
      </Tooltip>
    </i>
  );
};
