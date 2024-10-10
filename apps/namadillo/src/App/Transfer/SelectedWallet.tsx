import { shortenAddress } from "@namada/utils";
import clsx from "clsx";
import { WalletProvider } from "types";

type SelectedWalletProps = {
  wallet: WalletProvider;
  address?: string;
  onClick?: () => void;
};

export const SelectedWallet = ({
  wallet,
  onClick,
  address,
}: SelectedWalletProps): JSX.Element => {
  if (!address) return <></>;
  return (
    <div
      role="button"
      className={clsx(
        "flex justify-between items-center gap-2 text-sm text-neutral-500",
        "font-light text-right transition-colors",
        { "hover:text-neutral-400": Boolean(onClick), "cursor-auto": !onClick }
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
