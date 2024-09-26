import { Asset } from "@chain-registry/types";
import { Stack } from "@namada/components";
import { Search } from "App/Common/Search";
import { SelectModal } from "App/Common/SelectModal";
import clsx from "clsx";
import { useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";
import { AssetCard } from "./AssetCard";

type SelectWalletModalProps = {
  onClose: () => void;
  onSelect: (asset: Asset) => void;
  assets: Asset[];
};

export const SelectAssetModal = ({
  onClose,
  onSelect,
  assets,
}: SelectWalletModalProps): JSX.Element => {
  const [filter, setFilter] = useState("");

  const filteredAssets = useMemo(() => {
    return assets.filter(
      (asset) =>
        asset.name.indexOf(filter) >= 0 || asset.symbol.indexOf(filter) >= 0
    );
  }, [assets, filter]);

  return (
    <SelectModal title="Select Asset" onClose={onClose}>
      <div className="mb-4">
        <Search placeholder="Search chain" onChange={setFilter} />
      </div>
      <Stack
        as="ul"
        gap={0}
        className="max-h-[400px] overflow-auto dark-scrollbar pb-4 mr-[-0.5rem]"
      >
        {filteredAssets.map((asset: Asset, index: number) => (
          <li key={index} className="text-sm">
            <button
              onClick={() => {
                onSelect(asset);
                onClose();
              }}
              className={twMerge(
                clsx(
                  "w-full rounded-sm border border-transparent",
                  "hover:border-neutral-400 transition-colors duration-150"
                )
              )}
            >
              <AssetCard asset={asset} />
            </button>
          </li>
        ))}
      </Stack>
    </SelectModal>
  );
};
