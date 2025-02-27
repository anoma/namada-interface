import { CopyToClipboardControl, Tooltip } from "@namada/components";
import { routes } from "App/routes";
import { defaultAccountAtom } from "atoms/accounts";
import { NamadaKeychain } from "hooks/useNamadaKeychain";
import { useAtomValue } from "jotai";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AccountIconButton,
  accountIconButtonClassname,
} from "./AccountIconButton";
import { DisconnectAccountIcon } from "./DisconnectAccountIcon";
import { SwitchAccountIcon } from "./SwitchAccountIcon";
import NamadaWalletIcon from "./assets/namada-wallet-icon.svg";

export const NamadaAccount = (): JSX.Element => {
  const { data: account, isFetching } = useAtomValue(defaultAccountAtom);
  const location = useLocation();
  const navigate = useNavigate();

  if (!account || isFetching) {
    return <></>;
  }

  const onClickDisconnect = async (): Promise<void> => {
    const namada = await new NamadaKeychain().get();
    if (namada) {
      await namada.disconnect();
    }
  };

  return (
    <div className="flex items-center rounded-sm text-sm text-white bg-black px-1">
      <span className="flex items-center gap-2 relative group/tooltip">
        <CopyToClipboardControl
          className={accountIconButtonClassname}
          value={account.address || ""}
        >
          <img src={NamadaWalletIcon} alt="Namada Wallet" className="w-6 h-6" />
          <span className="mr-1">{account.alias}</span>
        </CopyToClipboardControl>
        <Tooltip position="left">{account.address}</Tooltip>
      </span>

      <AccountIconButton
        onClick={() => {
          navigate(routes.switchAccount, {
            state: { backgroundLocation: location },
          });
        }}
      >
        <SwitchAccountIcon />
      </AccountIconButton>

      <AccountIconButton onClick={onClickDisconnect}>
        <DisconnectAccountIcon />
      </AccountIconButton>
    </div>
  );
};
