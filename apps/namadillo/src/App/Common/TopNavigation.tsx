import { ToggleButton } from "@namada/components";
import { ActiveAccount } from "App/Common/ActiveAccount";
import { ConnectExtensionButton } from "App/Common/ConnectExtensionButton";
import SettingsRoutes from "App/Settings/routes";
import MessageRoutes from "App/SignMessages/routes";
import {
  hideBalancesAtom,
  namadaExtensionConnectedAtom,
  signArbitraryEnabledAtom,
} from "atoms/settings";
import { useAtom, useAtomValue } from "jotai";
import { AiOutlineMessage } from "react-icons/ai";
import { IoSettingsOutline } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import { SyncIndicator } from "./SyncIndicator";

export const TopNavigation = (): JSX.Element => {
  const isExtensionConnected = useAtomValue(namadaExtensionConnectedAtom);
  const [hideBalances, setHideBalances] = useAtom(hideBalancesAtom);
  const signArbitraryEnabled = useAtomValue(signArbitraryEnabledAtom);
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      {!isExtensionConnected && (
        <span>
          <ConnectExtensionButton />
        </span>
      )}

      {isExtensionConnected && (
        <div className="flex items-center gap-6">
          <ToggleButton
            label="Hide Balances"
            checked={hideBalances}
            onChange={() => setHideBalances(!hideBalances)}
            containerProps={{ className: "text-white flex" }}
          />
          <button
            className="text-2xl text-yellow hover:text-cyan"
            title="Settings"
            onClick={() =>
              navigate(SettingsRoutes.index(), {
                state: { backgroundLocation: location },
              })
            }
          >
            <IoSettingsOutline />
          </button>
          {signArbitraryEnabled && (
            <button
              className="text-2xl text-yellow hover:text-cyan"
              title="Sign Message"
              onClick={() =>
                navigate(MessageRoutes.index(), {
                  state: { backgroundLocation: location },
                })
              }
            >
              <AiOutlineMessage />
            </button>
          )}
          <div />
          <SyncIndicator />
          <ActiveAccount />
        </div>
      )}
    </>
  );
};
