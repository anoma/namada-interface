import { ConnectExtensionButton } from "App/Common/ConnectExtensionButton";
import SettingsRoutes from "App/Settings/routes";
import MessageRoutes from "App/SignMessages/routes";
import {
  namadaExtensionConnectedAtom,
  signArbitraryEnabledAtom,
} from "atoms/settings";
import { useAtomValue } from "jotai";
import { AiOutlineMessage } from "react-icons/ai";
import { IoSettingsOutline } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import { ActiveAccount } from "./ActiveAccount";
import { SyncIndicator } from "./SyncIndicator";

export const TopNavigation = (): JSX.Element => {
  const isExtensionConnected = useAtomValue(namadaExtensionConnectedAtom);
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
