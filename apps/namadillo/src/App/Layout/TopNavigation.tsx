import { ActionButton } from "@namada/components";
import { ConnectExtensionButton } from "App/Common/ConnectExtensionButton";
import SettingsRoutes from "App/Settings/routes";
import MessageRoutes from "App/SignMessages/routes";
import {
  applicationFeaturesAtom,
  namadaExtensionConnectedAtom,
  signArbitraryEnabledAtom,
} from "atoms/settings";
import { useAtomValue } from "jotai";
import { AiOutlineMessage } from "react-icons/ai";
import { IoSettingsOutline } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import TransferRoutes from "../Transfer/routes";
import { ActiveAccount } from "./ActiveAccount";
import { SyncIndicator } from "./SyncIndicator";

export const TopNavigation = (): JSX.Element => {
  const isExtensionConnected = useAtomValue(namadaExtensionConnectedAtom);
  const signArbitraryEnabled = useAtomValue(signArbitraryEnabledAtom);
  const { maspEnabled, namTransfersEnabled } = useAtomValue(
    applicationFeaturesAtom
  );
  const location = useLocation();
  const navigate = useNavigate();

  if (!isExtensionConnected) {
    return (
      <div className="w-fit justify-self-end">
        <ConnectExtensionButton />
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center gap-4 sm:gap-6">
      <div className="hidden lg:flex gap-2">
        {maspEnabled && (
          <ActionButton
            href={TransferRoutes.shield().url}
            size="sm"
            className="w-[140px]"
          >
            Shield assets
          </ActionButton>
        )}
        {namTransfersEnabled && (
          <ActionButton
            href={TransferRoutes.namTransfer().url}
            size="sm"
            backgroundColor="white"
            className="w-[140px]"
          >
            Transfer
          </ActionButton>
        )}
      </div>

      <div className="flex-1" />

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

      <SyncIndicator />

      <ActiveAccount />
    </div>
  );
};
