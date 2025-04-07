import { CopyToClipboardControl, Tooltip } from "@namada/components";
import { AccountType } from "@namada/types";
import { shortenAddress } from "@namada/utils";
import { routes } from "App/routes";
import { accountsAtom, allDefaultAccountsAtom } from "atoms/accounts";
import { NamadaKeychain } from "hooks/useNamadaKeychain";
import { useAtomValue } from "jotai";
import { useLocation, useNavigate } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import { AccountIconButton } from "./AccountIconButton";
import { DisconnectAccountIcon } from "./DisconnectAccountIcon";
import { SwitchAccountIcon } from "./SwitchAccountIcon";
import NamadaWalletIcon from "./assets/namada-wallet-icon.svg";

const AddressField = ({
  label,
  value,
  isShielded,
}: {
  label: string;
  value?: string;
  isShielded?: boolean;
}): JSX.Element => {
  if (!value) {
    return <></>;
  }
  return (
    <div>
      <div className="mb-0.5">{label}</div>
      <CopyToClipboardControl
        value={value}
        className={twMerge(
          "border rounded-sm font-mono p-2 opacity-80 transition-opacity hover:opacity-100",
          isShielded && "border-yellow"
        )}
      >
        {shortenAddress(value)}
      </CopyToClipboardControl>
    </div>
  );
};

export const NamadaAccount = (): JSX.Element => {
  const { data: accounts, isFetching } = useAtomValue(allDefaultAccountsAtom);
  const allAccounts = useAtomValue(accountsAtom);

  const location = useLocation();
  const navigate = useNavigate();

  if (isFetching) {
    return <></>;
  }

  const transparentAccount = accounts?.find(
    (account) => account.type !== AccountType.ShieldedKeys
  );
  const shieldedAccount = accounts?.find(
    (account) => account.type === AccountType.ShieldedKeys
  );

  const hasDefaultAccount = !!accounts?.length;

  const alias = transparentAccount?.alias ?? shieldedAccount?.alias;
  const hasMoreThanOneAccount = !!allAccounts.data?.find(
    (a) => a.alias !== alias
  );

  const onClickDisconnect = async (): Promise<void> => {
    const namada = await new NamadaKeychain().get();
    if (namada) {
      await namada.disconnect();
    }
  };

  return (
    <div className="flex items-center rounded-sm text-sm text-white bg-black px-2">
      {hasDefaultAccount && (
        <div className="relative group/tooltip">
          <div className="flex items-center gap-2">
            <img
              src={NamadaWalletIcon}
              alt="Namada Wallet"
              className="w-6 h-6"
            />
            <span className="mr-1">
              {transparentAccount?.alias ?? shieldedAccount?.alias}
            </span>
          </div>
          <Tooltip position="left" className="z-20">
            <div className="pt-2 pb-3 flex flex-col gap-2">
              <AddressField
                label="Transparent address"
                value={transparentAccount?.address}
              />
              <AddressField
                label="Shielded address"
                value={shieldedAccount?.address}
                isShielded
              />
            </div>
          </Tooltip>
        </div>
      )}

      {hasMoreThanOneAccount && (
        <AccountIconButton
          onClick={() => {
            navigate(routes.switchAccount, {
              state: { backgroundLocation: location },
            });
          }}
        >
          <SwitchAccountIcon />
        </AccountIconButton>
      )}

      {hasDefaultAccount && (
        <AccountIconButton onClick={onClickDisconnect}>
          <DisconnectAccountIcon />
        </AccountIconButton>
      )}
    </div>
  );
};
