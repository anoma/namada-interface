import { tv } from "tailwind-variants";

const circleFit = tv({
  slots: {
    wrapper: "w-full h-full",
    left: "float-left w-1/2 h-full",
    right: "float-right w-1/2 h-full",
  },
});

/**
 * Returns the average of two angles in a clockwise direction.
 */
const averageAngle = (startAngle: number, endAngle: number): number => {
  if (startAngle < endAngle) {
    return (endAngle + startAngle) / 2;
  } else {
    return ((startAngle + endAngle + 360) / 2) % 360;
  }
};

/**
 * Returns a list of angles between a start angle and an end angle up to a given
 * accuracy by recursively inserting the angle halfway between each adjacent
 * pair of angles.
 */
const angleList = (
  startAngle: number,
  endAngle: number,
  accuracy: number
): number[] => {
  if (accuracy === 0) {
    return [startAngle, endAngle];
  } else {
    const iter = angleList(startAngle, endAngle, accuracy - 1);

    return iter.reduce<number[]>((acc, curr, i) => {
      if (i === iter.length - 1) {
        return [...acc, curr];
      } else {
        return [...acc, curr, averageAngle(curr, iter[i + 1])];
      }
    }, []);
  }
};

/**
 * Returns a coordinate on the circle's circumference.
 */
const circumferencePoint = (
  angle: number,
  offsetX: string,
  offsetY: string
): string =>
  `calc(100% * cos(${angle}deg) + ${offsetX})` +
  " " +
  `calc(50% * sin(${angle}deg) + ${offsetY})`;

/**
 * Returns a CSS polygon string of a cutout semi-circle.
 */
const polygonString = (
  accuracy: number,
  startAngle: number,
  endAngle: number,
  offsetX: string,
  offsetY: string,
  startPoint: string,
  endPoint: string
): string => {
  const angles = angleList(startAngle, endAngle, accuracy);

  const points = angles.map((angle) =>
    circumferencePoint(angle, offsetX, offsetY)
  );

  const pointsString = points.join(",");

  return `polygon(${startPoint}, ${pointsString}, ${endPoint})`;
};

/**
 * Utility for fitting content in a circle.
 */
export const CircleFit: React.FC<
  {
    accuracy?: number;
    children?: React.ReactNode;
  } & React.ComponentProps<"div">
> = ({ accuracy = 5, children, ...rest }) => {
  const { wrapper, left, right } = circleFit();

  const leftPolygon = polygonString(
    accuracy,
    90,
    270,
    "100%",
    "50%",
    "0 100%",
    "0 0"
  );

  const rightPolygon = polygonString(
    accuracy,
    270,
    90,
    "0px",
    "50%",
    "100% 0",
    "100% 100%"
  );

  return (
    <div className={wrapper()} {...rest}>
      <div className={left()} style={{ shapeOutside: leftPolygon }}></div>
      <div className={right()} style={{ shapeOutside: rightPolygon }}></div>
      {children}
    </div>
  );
};
