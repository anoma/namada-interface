import { shortenAddress } from "@namada/utils";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { WalletProvider } from "types";

type SelectedWalletProps = {
  wallet: WalletProvider;
  address?: string;
  className?: string;
  onClick?: () => void;
};

export const SelectedWallet = ({
  wallet,
  onClick,
  address,
  className = "",
}: SelectedWalletProps): JSX.Element => {
  if (!address) return <></>;
  return (
    <div
      role="button"
      className={twMerge(
        clsx(
          "flex justify-between items-center gap-2.5 text-sm text-neutral-500",
          "font-light text-right transition-colors",
          {
            "hover:text-neutral-400": Boolean(onClick),
            "cursor-auto": !onClick,
          },
          className
        )
      )}
      onClick={onClick}
    >
      {address && shortenAddress(address, 8, 6)}
      <img
        src={wallet.iconUrl}
        alt={wallet.name + " Logo"}
        className="w-6 select-none"
      />
    </div>
  );
};
