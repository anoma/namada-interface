import { ToggleButton } from "@namada/components";
import { ActiveAccount } from "App/Common/ActiveAccount";
import { ConnectExtensionButton } from "App/Common/ConnectExtensionButton";
import SettingsRoutes from "App/Settings/routes";
import { hideBalancesAtom, namadaExtensionConnectedAtom } from "atoms/settings";
import { useAtom, useAtomValue } from "jotai";
import { IoSettingsOutline } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";

export const TopNavigation = (): JSX.Element => {
  const isExtensionConnected = useAtomValue(namadaExtensionConnectedAtom);
  const [hideBalances, setHideBalances] = useAtom(hideBalancesAtom);
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
            containerProps={{ className: "hidden text-white md:flex" }}
          />
          <button
            className="text-2xl text-yellow hover:text-cyan"
            onClick={() =>
              navigate(SettingsRoutes.index(), {
                state: { backgroundLocation: location },
              })
            }
          >
            <IoSettingsOutline />
          </button>
          <ActiveAccount />
        </div>
      )}
    </>
  );
};
