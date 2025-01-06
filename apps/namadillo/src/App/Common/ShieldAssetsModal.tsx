import { routes } from "App/routes";
import { wallets } from "integrations";
import { getAssetImageUrl } from "integrations/utils";
import { useNavigate } from "react-router-dom";
import { namadaAsset } from "utils";
import { SelectOptionModal } from "./SelectOptionModal";

type ShieldAssetsModal = {
  onClose: () => void;
};

export const ShieldAssetsModal = ({
  onClose,
}: ShieldAssetsModal): JSX.Element => {
  const navigate = useNavigate();
  const goTo = (url: string): void => {
    navigate(url);
    onClose();
  };

  return (
    <SelectOptionModal
      title="Shield Assets"
      onClose={onClose}
      items={[
        {
          title: "IBC Shield",
          icon: <img src={wallets.keplr.iconUrl} className="w-full" />,
          onClick: () => goTo(routes.ibc),
          children: "Shield external assets over IBC to Namada",
        },
        {
          title: "Internal Shield",
          icon: (
            <span className="flex w-full bg-yellow rounded-md">
              <img src={getAssetImageUrl(namadaAsset())} className="w-full" />
            </span>
          ),
          onClick: () => goTo(routes.maspShield),
          children: "Shield Assets from your Namada transparent account",
        },
      ]}
    />
  );
};
