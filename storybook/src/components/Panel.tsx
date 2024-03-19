import clsx from "clsx";

type PanelProps = {
  children: React.ReactNode;
};

export const Panel = ({ children }: PanelProps): JSX.Element => {
  return (
    <div
      className={clsx(
        "relative text-white rounded-lg bg-gray w-[540px] min-h-[640px]"
      )}
    >
      {children}
    </div>
  );
};
