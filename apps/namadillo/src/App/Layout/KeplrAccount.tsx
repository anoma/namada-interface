import { connectedWalletsAtom } from "atoms/integrations";
import { wallets } from "integrations";
import { KeplrWalletManager } from "integrations/Keplr";
import { useAtom } from "jotai";
import { DisconnectAccountIcon } from "./DisconnectAccountIcon";

export const KeplrAccount = (): JSX.Element => {
  const [connectedWallets, setConnectedWallets] = useAtom(connectedWalletsAtom);

  if (!connectedWallets.keplr) {
    return <></>;
  }

  const onClickDisconnect = async (): Promise<void> => {
    setConnectedWallets((obj) => ({ ...obj, keplr: false }));
    const keplr = await new KeplrWalletManager().get();
    if (keplr) {
      await keplr.disable();
    }
  };

  return (
    <div className="flex items-center rounded-sm text-sm text-white bg-rblack pl-2 pr-1">
      <img
        src={wallets.keplr.iconUrl}
        alt="Namada Wallet"
        className="w-5 h-5"
      />
      <button
        className="p-1 opacity-80 transition-opacity hover:opacity-100"
        onClick={onClickDisconnect}
      >
        <DisconnectAccountIcon />
      </button>
    </div>
  );
};
