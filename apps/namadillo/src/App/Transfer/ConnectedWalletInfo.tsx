import { WalletProvider } from "types";
import { SelectedWallet } from "./SelectedWallet";

type ConnectedWalletInfoProps = {
  wallet: WalletProvider;
  walletAddress: string;
};

export const ConnectedWalletInfo = ({
  wallet,
  walletAddress,
}: ConnectedWalletInfoProps): JSX.Element => {
  return (
    <div className="flex justify-between items-center">
      <SelectedWallet
        wallet={wallet}
        address={walletAddress}
        className="[&_img]:-order-1"
      />
      <span className="text-sm text-neutral-500">Connected</span>
    </div>
  );
};
