import { Stack } from "@namada/components";
import clsx from "clsx";

type AssetsModalCard = {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
} & React.PropsWithChildren;

export const AssetsModalCard = ({
  title,
  icon,
  children,
  onClick,
}: AssetsModalCard): JSX.Element => {
  return (
    <Stack
      gap={6}
      onClick={onClick}
      className={clsx(
        "w-[220px] h-full items-stretch pb-8 pt-2.5 px-4 border rounded-md border-transparent transition-colors cursor-pointer",
        "items-center text-white text-center hover:border-yellow"
      )}
    >
      <h3 className="text-xl font-medium">{title}</h3>
      <aside className="max-w-[78px]">{icon}</aside>
      <div className="text-base/tight">{children}</div>
    </Stack>
  );
};
