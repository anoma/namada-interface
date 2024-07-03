import { IoWarningOutline } from "react-icons/io5";

export const FeeWarning = (): JSX.Element => {
  return (
    <div className="flex text-xs items-center gap-1 text-yellow">
      <i className="text-sm">
        <IoWarningOutline />
      </i>
      Remember to keep a small amount of NAM for fees
    </div>
  );
};
