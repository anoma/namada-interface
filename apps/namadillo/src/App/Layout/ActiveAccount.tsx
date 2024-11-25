import { CopyToClipboardControl, Tooltip } from "@namada/components";
import { routes } from "App/routes";
import { defaultAccountAtom, disconnectAccountAtom } from "atoms/accounts";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import { useLocation, useNavigate } from "react-router-dom";
import { DisconnectAccountIcon } from "./DisconnectAccountIcon";
import { SwitchAccountIcon } from "./SwitchAccountIcon";
import NamadaWalletIcon from "./assets/namada-wallet-icon.svg";

export const ActiveAccount = (): JSX.Element => {
  const { data: account, isFetching } = useAtomValue(defaultAccountAtom);
  const { mutateAsync: disconnect } = useAtomValue(disconnectAccountAtom);
  const location = useLocation();
  const navigate = useNavigate();

  if (!account || isFetching) {
    return <></>;
  }

  const buttonClassName =
    "p-1 px-2 opacity-80 transition-opacity hover:opacity-100";

  return (
    <div>
      <span
        className={clsx(
          "p-2.5 flex items-center text-sm rounded-sm",
          "text-white bg-rblack rounded-xs"
        )}
      >
        <span className="flex items-center gap-2 relative group/tooltip">
          <CopyToClipboardControl
            className={buttonClassName}
            value={account.address || ""}
          >
            <img src={NamadaWalletIcon} alt="Namada Wallet" />
            <span className="mr-2">{account.alias}</span>
          </CopyToClipboardControl>
          <Tooltip position="left">{account.address}</Tooltip>
        </span>
        <button
          className={buttonClassName}
          onClick={() => {
            navigate(routes.switchAccount, {
              state: { backgroundLocation: location },
            });
          }}
        >
          <SwitchAccountIcon />
        </button>
        <button className={buttonClassName} onClick={() => disconnect()}>
          <DisconnectAccountIcon />
        </button>
      </span>
    </div>
  );
};
