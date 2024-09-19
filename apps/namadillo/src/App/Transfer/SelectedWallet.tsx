import { integrations } from "@namada/integrations";
import { shortenAddress } from "@namada/utils";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { WalletProvider } from "types";

type SelectedWalletProps = {
  wallet: WalletProvider;
  onClick?: () => void;
};

export const SelectedWallet = ({
  wallet,
  onClick,
}: SelectedWalletProps): JSX.Element => {
  const [walletAddress, setWalletAddress] = useState("");

  const loadAccounts = async (): Promise<void> => {
    try {
      const integration = integrations[wallet.id];
      integration.detect();
      await integration.connect();
      const accounts = await integration.accounts();
      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0].address);
      }
    } catch {
      // TODO: handle error catching
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  return (
    <div
      role="button"
      className={clsx(
        "flex justify-between items-center gap-2 text-sm text-neutral-500",
        "font-light text-right transition-colors hover:text-neutral-400"
      )}
      onClick={onClick}
    >
      {walletAddress && shortenAddress(walletAddress, 8, 6)}
      <img src={wallet.iconUrl} alt={wallet.name + " Logo"} className="w-6" />
    </div>
  );
};
