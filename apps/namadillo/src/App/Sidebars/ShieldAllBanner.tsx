import { ActionButton } from "@namada/components";
import TransferRoutes from "App/Transfer/routes";
import { twMerge } from "tailwind-merge";

export const ShieldAllBanner = (): JSX.Element => {
  return (
    <div
      className={twMerge(
        "bg-yellow rounded-sm h-fit",
        "flex flex-col items-center gap-2",
        "p-3"
      )}
    >
      <div className="w-[145px] h-[145px] bg-white">img</div>
      <ActionButton
        href={TransferRoutes.shieldAll().url}
        className="max-w-[160px]"
        size="sm"
        backgroundColor="black"
        textColor="yellow"
        backgroundHoverColor="yellow"
      >
        Shield All Assets
      </ActionButton>
    </div>
  );
};
