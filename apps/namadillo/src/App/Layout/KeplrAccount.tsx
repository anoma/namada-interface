import { Tooltip } from "@namada/components";
import { defaultAccountAtom, disconnectAccountAtom } from "atoms/accounts";
import { wallets } from "integrations";
import { useAtomValue } from "jotai";
import { DisconnectAccountIcon } from "./DisconnectAccountIcon";

export const KeplrAccount = (): JSX.Element => {
  const { data: account, isFetching } = useAtomValue(defaultAccountAtom);
  const { mutateAsync: disconnect } = useAtomValue(disconnectAccountAtom);

  if (!account || isFetching) {
    return <></>;
  }

  const buttonClassName = "p-1 opacity-80 transition-opacity hover:opacity-100";

  return (
    <div className="flex items-center rounded-sm text-sm text-white bg-rblack pl-2 pr-1">
      <span className="flex items-center gap-2 relative group/tooltip">
        <img
          src={wallets.keplr.iconUrl}
          alt="Namada Wallet"
          className="w-5 h-5"
        />
        <Tooltip position="left">{account.address}</Tooltip>
      </span>
      <button className={buttonClassName} onClick={() => disconnect()}>
        <DisconnectAccountIcon />
      </button>
    </div>
  );
};
