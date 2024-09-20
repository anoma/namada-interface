import { CopyToClipboardControl, Tooltip } from "@namada/components";
import SwitchAccountRoutes from "App/SwitchAccount/routes";
import { defaultAccountAtom, disconnectAccountAtom } from "atoms/accounts";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import { useLocation, useNavigate } from "react-router-dom";
import { DisconnectAccountIcon } from "./DisconnectAccountIcon";
import { SwitchAccountIcon } from "./SwitchAccountIcon";

export const ActiveAccount = (): JSX.Element => {
  const { data: account, isFetching } = useAtomValue(defaultAccountAtom);
  const { mutateAsync: disconnect } = useAtomValue(disconnectAccountAtom);
  const location = useLocation();
  const navigate = useNavigate();

  if (!account || isFetching) {
    return <></>;
  }

  const buttonClassName = "p-1 opacity-80 transition-opacity hover:opacity-100";

  return (
    <div>
      <span
        className={clsx(
          "px-4 py-2.5 flex items-center text-xs rounded-sm",
          "text-white bg-black rounded-xs"
        )}
      >
        <span className="flex items-center gap-2 relative group/tooltip">
          <CopyToClipboardControl
            className={buttonClassName}
            value={account.address || ""}
          >
            {account.alias}
          </CopyToClipboardControl>
          <Tooltip position="left">{account.address}</Tooltip>
        </span>
        <button
          className={buttonClassName}
          onClick={() => {
            navigate(SwitchAccountRoutes.index(), {
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
