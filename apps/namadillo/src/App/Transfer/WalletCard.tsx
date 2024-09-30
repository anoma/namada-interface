import { GoLinkExternal } from "react-icons/go";
import { WalletProvider } from "types";

type WalletCardProps = {
  wallet: WalletProvider;
  installed: boolean;
  connected: boolean;
  onConnect?: () => void;
  onSelect?: () => void;
};

export const WalletCard = ({
  wallet,
  installed,
  connected,
  onConnect,
  onSelect,
}: WalletCardProps): JSX.Element => {
  const getDownloadUrl = (): string => {
    if (/firefox/i.test(navigator.userAgent)) {
      return wallet.downloadUrl.firefox;
    }
    return wallet.downloadUrl.chrome;
  };

  return (
    <div className="flex justify-between items-center w-full">
      <span className="flex gap-2 items-center text-white">
        <img src={wallet.iconUrl} className="w-8 aspect-square rounded-sm" />
        {wallet.name}
      </span>
      <span className="text-xs text-neutral-400 hover:text-yellow">
        {!installed && (
          <a
            href={getDownloadUrl()}
            className="flex items-center gap-2"
            target="_blank"
            rel="nofollow noreferrer"
          >
            Install <GoLinkExternal />
          </a>
        )}
        {installed && !connected && (
          <button onClick={onConnect}>Connect</button>
        )}
        {installed && connected && <button onClick={onSelect}>Select</button>}
      </span>
    </div>
  );
};
