import { routes } from "App/routes";
import { useModalCloseEvent } from "hooks/useModalCloseEvent";
import { wallets } from "integrations";
import { getAssetImageUrl } from "integrations/utils";
import { useNavigate } from "react-router-dom";
import { namadaAsset } from "utils";
import { SelectOptionModal } from "./SelectOptionModal";

export const ShieldAssetsModal = (): JSX.Element => {
  const { onCloseModal } = useModalCloseEvent();
  const navigate = useNavigate();

  return (
    <SelectOptionModal
      title="Shield Assets"
      onClose={onCloseModal}
      items={[
        {
          title: "IBC Shield",
          icon: <img src={wallets.keplr.iconUrl} className="w-full" />,
          onClick: () => navigate(routes.ibc),
          children: "Shield external assets over IBC to Namada",
        },
        {
          title: "Internal Shield",
          icon: (
            <span className="flex w-full bg-yellow rounded-md">
              <img src={getAssetImageUrl(namadaAsset())} className="w-full" />
            </span>
          ),
          onClick: () => navigate(routes.maspShield),
          children: "Shield Assets from your Namada transparent account",
        },
      ]}
    />
  );
};
