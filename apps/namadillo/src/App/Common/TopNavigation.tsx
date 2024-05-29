import { ToggleButton } from "@namada/components";
import { Chain } from "@namada/types";
import { ActiveAccount } from "App/Common/ActiveAccount";
import { ConnectExtensionButton } from "App/Common/ConnectExtensionButton";
import { ConnectStatus, useExtensionConnect } from "hooks/useExtensionConnect";
import { useAtom } from "jotai";
import { IoSettingsOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import { hideBalancesAtom } from "slices/settings";

type Props = {
  chain: Chain;
};

export const TopNavigation = ({ chain }: Props): JSX.Element => {
  const { connectionStatus } = useExtensionConnect(chain);
  const [hideBalances, setHideBalances] = useAtom(hideBalancesAtom);

  return (
    <>
      {connectionStatus !== ConnectStatus.CONNECTED && (
        <span>
          <ConnectExtensionButton chain={chain} />
        </span>
      )}

      {connectionStatus === ConnectStatus.CONNECTED && (
        <div className="flex items-center gap-6">
          <ToggleButton
            label="Hide Balances"
            checked={hideBalances}
            onChange={() => setHideBalances(!hideBalances)}
            containerProps={{ className: "hidden text-white md:flex" }}
          />
          <Link className="text-2xl text-yellow hover:text-cyan" to="/">
            <IoSettingsOutline />
          </Link>
          <ActiveAccount />
        </div>
      )}
    </>
  );
};
