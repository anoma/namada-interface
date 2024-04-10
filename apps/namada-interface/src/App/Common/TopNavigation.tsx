import { ToggleButton } from "@namada/components";
import { Chain } from "@namada/types";
import { FiatCurrencyList } from "@namada/utils";
import { ActiveAccount } from "App/Common/ActiveAccount";
import { ConnectExtensionButton } from "App/Common/ConnectExtensionButton";
import { CurrencySelector } from "App/Common/CurrencySelector";
import { ConnectStatus, useExtensionConnect } from "hooks/useExtensionConnect";
import { useAtom } from "jotai";
import { Suspense } from "react";
import { hideBalancesAtom, selectedCurrencyAtom } from "slices/settings";

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
            currencies={FiatCurrencyList}
            value={selectedCurrency}
            onChange={setSelectedCurrency}
          />
          {separator}
          <Suspense fallback={null}>
            <ActiveAccount />
          </Suspense>
        </div>
      )}
    </>
  );
};
