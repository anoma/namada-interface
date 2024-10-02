import { integrations } from "@namada/integrations";
import { shortenAddress } from "@namada/utils";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { WalletProvider } from "types";

type SelectedWalletProps = {
  wallet: WalletProvider;
  onClick?: () => void;
  isShielded?: boolean;
};

export const SelectedWallet = ({
  wallet,
  onClick,
  isShielded,
}: SelectedWalletProps): JSX.Element => {
  const [walletAddress, setWalletAddress] = useState("");

  const loadAccounts = async (): Promise<void> => {
    try {
      const integration = integrations[wallet.id];
      integration.detect();
      await integration.connect();
      const accounts = await integration.accounts();

      if (accounts && accounts.length > 0) {
        if (wallet.id === "namada" && isShielded && accounts.length > 1) {
          setWalletAddress(accounts[1].address);
          return;
        }
        setWalletAddress(accounts[0].address);
      }
    } catch {
      // TODO: handle error catching
    }
  };

  useEffect(() => {
    loadAccounts();
  }, [isShielded]);

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
      {walletAddress && shortenAddress(walletAddress, 8, 6)}
      <img
        src={wallet.iconUrl}
        alt={wallet.name + " Logo"}
        className="w-6 select-none"
      />
    </div>
  );
};
