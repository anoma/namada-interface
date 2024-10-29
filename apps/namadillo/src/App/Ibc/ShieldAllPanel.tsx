import { Asset } from "@chain-registry/types";
import { ActionButton, Heading, Stack } from "@namada/components";
import svgImg from "App/Assets/ShieldedParty.svg";
import { SelectedWallet } from "App/Transfer/SelectedWallet";
import { TransferTransactionFee } from "App/Transfer/TransferTransactionFee";
import { AssetWithBalance } from "atoms/integrations";
import clsx from "clsx";
import { getTransactionFee } from "integrations/utils";
import { useEffect, useMemo, useState } from "react";
import { ChainRegistryEntry, WalletProvider } from "types";
import { ShieldAllAssetList } from "./ShieldAllAssetList";

type ShieldAllPanelProps = {
  registry: ChainRegistryEntry;
  wallet: WalletProvider;
  walletAddress: string;
  isLoading: boolean;
  assetList: AssetWithBalance[];
};

export const ShieldAllPanel = ({
  registry,
  wallet,
  walletAddress,
  isLoading,
  assetList,
}: ShieldAllPanelProps): JSX.Element => {
  const [selectedAssets, setSelectedAssets] =
    useState<Record<string, boolean>>();

  useEffect(() => {
    if (!isLoading && !selectedAssets) {
      const allChecked = assetList.reduce(
        (acc, current) => ({ ...acc, [current.asset.symbol]: true }),
        {}
      );
      setSelectedAssets(allChecked);
    }
  }, [isLoading, assetList]);

  const onToggleAsset = (asset: Asset): void => {
    setSelectedAssets((assets) => {
      if (!assets) return;
      return {
        ...assets,
        [asset.symbol]: !assets[asset.symbol],
      };
    });
  };

  const hasAssetsSelected = useMemo(
    () => Object.values(selectedAssets || {}).some(Boolean),
    [selectedAssets]
  );

  const transactionFee = getTransactionFee(registry);

  return (
    <section
      className={clsx(
        "flex flex-col bg-yellow text-black pt-8 pb-6 px-12",
        "w-full max-w-[590px] min-h-[600px] mx-auto rounded-md"
      )}
    >
      <div className="flex flex-col flex-1 justify-between">
        <Stack gap={3} className="text-center h-full">
          <img
            className="w-[120px] mx-auto select-none"
            src={`${svgImg}`}
            alt=""
          />
          <header>
            <Heading className="text-black uppercase text-3xl" level="h2">
              Shield All
            </Heading>
            <p>Review and confirm assets to shield</p>
          </header>
          <SelectedWallet
            wallet={wallet}
            address={walletAddress}
            className="text-black px-2 py-1.5 border rounded-sm"
            displayShortenedAddress={false}
          />
          <ShieldAllAssetList
            assets={assetList}
            checked={selectedAssets || {}}
            onToggleAsset={onToggleAsset}
          />
        </Stack>
        <Stack as="footer" gap={4}>
          {transactionFee && (
            <TransferTransactionFee
              transactionFee={transactionFee}
              isIbcTransfer={true}
            />
          )}
          <ActionButton
            backgroundColor="black"
            backgroundHoverColor="cyan"
            textColor="yellow"
            textHoverColor="black"
            disabled={!hasAssetsSelected}
            className="w-auto mx-auto"
          >
            Shield all my Assets
          </ActionButton>
        </Stack>
      </div>
    </section>
  );
};
