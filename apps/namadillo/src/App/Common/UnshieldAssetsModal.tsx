import { routes } from "App/routes";
import { wallets } from "integrations";
import { getAssetImageUrl } from "integrations/utils";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { namadaAsset } from "utils";
import { SelectOptionModal } from "./SelectOptionModal";

type UnshieldAssetsModal = {
  assetAddress?: string;
  onClose: () => void;
};

export const UnshieldAssetsModal = ({
  assetAddress,
  onClose,
}: UnshieldAssetsModal): JSX.Element => {
  const navigate = useNavigate();
  const goTo = (url: string): void => {
    const search = assetAddress ? `asset=${assetAddress}` : undefined;
    navigate({ pathname: url, search });
    onClose();
  };

  // TODO
  // We are auto-selecting the `Internal Unshield` option
  // while the unshield from Shielded Pool is not implemented.
  // https://github.com/anoma/namada-interface/issues/1638
  useEffect(() => {
    goTo(routes.maspUnshield);
  }, []);

  return (
    <SelectOptionModal
      title="Unshield Assets"
      onClose={onClose}
      items={[
        {
          title: "IBC Unshield",
          icon: <img src={wallets.keplr.iconUrl} className="w-full" />,
          onClick: () => goTo(routes.ibcWithdraw),
          children: "Unshield assets over IBC to an IBC chain",
        },
        {
          title: "Internal Unshield",
          icon: (
            <span className="flex w-full bg-yellow rounded-md">
              <img src={getAssetImageUrl(namadaAsset())} className="w-full" />
            </span>
          ),
          onClick: () => goTo(routes.maspUnshield),
          children:
            "Unshield assets from your Namada shielded to transparent account",
        },
      ]}
    />
  );
};
