import { ToggleButton } from "@namada/components";
import { Chain } from "@namada/types";
import { ConnectExtensionButton } from "App/Common/ConnectExtensionButton";
import clsx from "clsx";
import { Currencies } from "currencies";
import { ConnectStatus, useExtensionConnect } from "hooks/useExtensionConnect";
import { useAtom } from "jotai";
import { hideBalancesAtom, selectedCurrencyAtom } from "slices/settings";
import { CurrencySelector } from "../CurrencySelector";

type Props = {
  chain: Chain;
};

export const TopNavigation = ({ chain }: Props): JSX.Element => {
  const { connectionStatus } = useExtensionConnect(chain);
  const [selectedCurrency, setSelectedCurrency] = useAtom(selectedCurrencyAtom);
  const [hideBalances, setHideBalances] = useAtom(hideBalancesAtom);

  const separator = <span className="h-8 w-px bg-rblack" />;

  return (
    <>
      {connectionStatus !== ConnectStatus.CONNECTED && (
        <span>
          <ConnectExtensionButton chain={chain} />
        </span>
      )}

      {connectionStatus === ConnectStatus.CONNECTED && (
        <div className="flex items-center gap-5">
          <ToggleButton
            label="Hide Balances"
            checked={hideBalances}
            onChange={() => setHideBalances(!hideBalances)}
            containerProps={{ className: "text-white" }}
          />
          {separator}
          <CurrencySelector
            currencies={Currencies}
            value={selectedCurrency}
            onChange={setSelectedCurrency}
          />
          {separator}
          <div>
            <span
              className={clsx(
                "px-7 py-3.5 flex items-center text-xs text-white bg-black rounded-xs"
              )}
            >
              <i />
              <span>Namada Wallet 01</span>
            </span>
          </div>
        </div>
      )}
    </>
  );
};
