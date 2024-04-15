import BigNumber from "bignumber.js";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export type PieChartData = {
  value: number | BigNumber;
  color: string;
};

type PieChartProps = React.ComponentPropsWithRef<"svg"> & {
  id: string;
  data: PieChartData[];
  children?: React.ReactNode;
  radius?: number;
  strokeWidth?: number;
  segmentMargin?: number;
  contentProps?: React.ComponentPropsWithoutRef<"div">;
  onMouseEnter?: (data: PieChartData, index: number) => void;
  onMouseLeave?: () => void;
};

export const PieChart = ({
  id,
  data,
  children,
  strokeWidth = 10,
  radius = 50,
  segmentMargin = 2.5,
  contentProps = {},
  onMouseEnter,
  onMouseLeave,
  ...svgProps
}: PieChartProps): JSX.Element => {
  const length = 2 * Math.PI * (radius - strokeWidth);
  const filteredData = data.filter((el) => new BigNumber(el.value).gt(0));
  const margin = filteredData.length > 1 ? segmentMargin : 0;
  const { className: contentPropsClassName, ...contentPropsRest } =
    contentProps;

  const total = filteredData.reduce((acc, entry) => {
    return acc.plus(entry.value);
  }, new BigNumber(0));

  const percentages = filteredData.map((entry) =>
    new BigNumber(entry.value).div(total).toNumber()
  );

  let offset = 0;
  const renderData = (): React.ReactNode =>
    filteredData.map((dataItem, index) => {
      const segmentLength = length * percentages[index] - margin;
      const path = (
        <circle
          fill="none"
          key={`pie-chart-${id}-${index}`}
          cx={radius}
          cy={radius}
          strokeWidth={strokeWidth}
          strokeDashoffset={offset}
          strokeDasharray={`${segmentLength} ${length}`}
          r={radius - strokeWidth}
          stroke={dataItem.color}
          onMouseEnter={
            onMouseEnter ? () => onMouseEnter(dataItem, index) : undefined
          }
          onMouseLeave={onMouseLeave ? () => onMouseLeave() : undefined}
        />
      );
      offset -= segmentLength + margin;
      return path;
    });

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${radius * 2} ${radius * 2}`}
        width="100%"
        height="100%"
        {...svgProps}
      >
        {renderData()}
      </svg>
      <div
        className={twMerge(
          clsx(
            "absolute top-0 left-0 text-center w-full h-full",
            "flex items-center justify-center pointer-events-none"
          ),
          contentPropsClassName
        )}
        {...contentPropsRest}
      >
        {children}
      </div>
    </div>
  );
};
