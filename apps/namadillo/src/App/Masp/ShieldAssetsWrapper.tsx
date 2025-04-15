import { SelectOptionModal } from "App/Common/SelectOptionModal";
import { IbcTransfer } from "App/Ibc/IbcTransfer";
import { wallets } from "integrations";
import { getAssetImageUrl } from "integrations/utils";
import { useState } from "react";
import { namadaAsset } from "utils";
import { MaspShield } from "./MaspShield";

type SelectedRoute = "none" | "maspShield" | "ibc";

export const ShieldAssetsWrapper: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<SelectedRoute>("none");

  const CustomShieldAssetsModal = (): JSX.Element => {
    return (
      <SelectOptionModal
        title="Shield Assets"
        onClose={() => setShowModal(false)}
        items={[
          {
            title: "IBC Shield",
            icon: <img src={wallets.keplr.iconUrl} className="w-full" />,
            onClick: () => {
              setShowModal(false);
              setSelectedRoute("ibc");
            },
            children: "Shield external assets over IBC to Namada",
          },
          {
            title: "Internal Shield",
            icon: (
              <span className="flex w-full bg-yellow rounded-md">
                <img src={getAssetImageUrl(namadaAsset())} className="w-full" />
              </span>
            ),
            onClick: () => {
              setShowModal(false);
              setSelectedRoute("maspShield");
            },
            children: "Shield Assets from your Namada transparent account",
          },
        ]}
      />
    );
  };

  const renderSelectedComponent = (): JSX.Element | null => {
    switch (selectedRoute) {
      case "maspShield":
        return <MaspShield />;
      case "ibc":
        return <IbcTransfer />;
      default:
        return null;
    }
  };

  return (
    <div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 bg-black">
          <CustomShieldAssetsModal />
        </div>
      )}
      {!showModal && renderSelectedComponent()}
    </div>
  );
};
