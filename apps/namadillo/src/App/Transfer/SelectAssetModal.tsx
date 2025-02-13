import { Stack } from "@namada/components";
import { Search } from "App/Common/Search";
import { SelectModal } from "App/Common/SelectModal";
import { nativeTokenAddressAtom } from "atoms/chain/atoms";
import { applicationFeaturesAtom } from "atoms/settings/atoms";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import { useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Address, AddressWithAsset, WalletProvider } from "types";
import { AssetCard } from "./AssetCard";
import { ConnectedWalletInfo } from "./ConnectedWalletInfo";

type SelectWalletModalProps = {
  onClose: () => void;
  onSelect: (address: Address) => void;
  assets: AddressWithAsset[];
  wallet: WalletProvider;
  walletAddress: string;
};

export const SelectAssetModal = ({
  onClose,
  onSelect,
  assets,
  wallet,
  walletAddress,
}: SelectWalletModalProps): JSX.Element => {
  const { namTransfersEnabled } = useAtomValue(applicationFeaturesAtom);
  const nativeTokenAddress = useAtomValue(nativeTokenAddressAtom).data;

  const [filter, setFilter] = useState("");

  const filteredAssets = useMemo(() => {
    return assets.filter(
      ({ asset }) =>
        asset.name.toLowerCase().indexOf(filter.toLowerCase()) >= 0 ||
        asset.symbol.toLowerCase().indexOf(filter.toLowerCase()) >= 0
    );
  }, [assets, filter]);

  return (
    <SelectModal title="Select Asset" onClose={onClose}>
      <ConnectedWalletInfo wallet={wallet} walletAddress={walletAddress} />
      <div className="my-4">
        <Search placeholder="Search asset" onChange={setFilter} />
      </div>
      <Stack
        as="ul"
        gap={0}
        className="max-h-[400px] overflow-auto dark-scrollbar pb-4 mr-[-0.5rem]"
      >
        {filteredAssets.map(({ asset, originalAddress }) => {
          const disabled =
            !namTransfersEnabled && originalAddress === nativeTokenAddress;
          return (
            <li key={originalAddress} className="text-sm">
              <button
                onClick={() => {
                  onSelect(originalAddress);
                  onClose();
                }}
                className={twMerge(
                  clsx(
                    "w-full rounded-sm border border-transparent",
                    "hover:border-neutral-400 transition-colors duration-150",
                    { "pointer-events-none opacity-50": disabled }
                  )
                )}
                disabled={disabled}
              >
                <AssetCard asset={asset} disabled={disabled} />
              </button>
            </li>
          );
        })}
        {filteredAssets.length === 0 && (
          <p className="py-2 font-light">There are no available assets</p>
        )}
      </Stack>
    </SelectModal>
  );
};
