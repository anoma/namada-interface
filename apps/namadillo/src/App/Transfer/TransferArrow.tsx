import clsx from "clsx";
type TransferArrowProps = {
  color: string;
  isAnimating?: boolean;
};

export const TransferArrow = ({
  color,
  isAnimating = false,
}: TransferArrowProps): JSX.Element => (
  <div className={clsx("relative", { "animate-bounce": isAnimating })}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 511 510"
      className="w-full"
    >
      <path
        fill="#262626"
        d="M255.459 0c140.625 0 254.624 114.003 254.624 254.628S396.084 509.256 255.459 509.256.835 395.253.835 254.628 114.834 0 255.46 0Z"
      />
      <path
        fill={color}
        fillRule="evenodd"
        className="transition-colors duration-200"
        d="M255.459 32.532c-122.657 0-222.092 99.437-222.092 222.096s99.435 222.097 222.092 222.097c122.658 0 222.092-99.438 222.092-222.097S378.117 32.532 255.459 32.532Zm254.624 222.096C510.083 114.003 396.084 0 255.459 0S.835 114.003.835 254.628 114.834 509.256 255.46 509.256s254.624-114.003 254.624-254.628Z"
        clipRule="evenodd"
      />
      <path
        fill={color}
        fillRule="evenodd"
        className="transition-colors duration-200"
        d="m349.352 226.598-93.911 162.659-93.91-162.659h77.644v-95.794h32.532v95.794h77.645Z"
        clipRule="evenodd"
      />
    </svg>
  </div>
);
