import clsx from "clsx";

type RingProps = {
  children?: React.ReactNode;
  radius?: number;
  strokeWidth?: number;
  color?: string;
} & React.ComponentPropsWithRef<"svg">;

export const Ring: React.FC<RingProps> = ({
  children,
  radius = 40,
  strokeWidth = 5,
  color,
  ...svgProps
}) => (
  <div className="relative max-w-[380px] mx-auto">
    <svg
      viewBox={`0 0 ${radius * 2} ${radius * 2}`}
      width="100%"
      height="100%"
      {...svgProps}
    >
      <circle
        fill="none"
        cx={radius}
        cy={radius}
        strokeWidth={strokeWidth}
        r={radius - strokeWidth}
        stroke={color}
      />
    </svg>
    <div
      className={clsx(
        "absolute top-0 left-0 text-center w-full h-full flex items-center justify-center"
      )}
    >
      {children}
    </div>
  </div>
);
