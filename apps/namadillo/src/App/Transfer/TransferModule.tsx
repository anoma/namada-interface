import { Stack } from "@namada/components";
import BigNumber from "bignumber.js";
import { useState } from "react";
import { Asset, Chain } from "types";
import { SelectProviderModal } from "./SelectProviderModal";
import { TransferDestination } from "./TransferDestination";
import { TransferSource } from "./TransferSource";

type TransferModuleProps = {
  isConnected: boolean;
  sourceChain?: Chain;
  onChangeSourceChain?: () => void;
  destinationChain?: Chain;
  onChangeDestinationChain?: (chain: Chain) => void;
  selectedAsset?: Asset;
  onChangeSelectedAsset?: (asset: Asset | undefined) => void;
  amount?: BigNumber;
  onChangeAmount?: (amount: BigNumber) => void;
  isShielded?: boolean;
  onChangeShielded?: (isShielded: boolean) => void;
  enableCustomAddress?: boolean;
  onSubmitTransfer: () => void;
};

export const TransferModule = ({
  isConnected,
  selectedAsset,
  sourceChain,
  destinationChain,
  isShielded,
  onChangeShielded,
  enableCustomAddress,
}: TransferModuleProps): JSX.Element => {
  const [providerSelectorModalOpen, setProviderSelectorModalOpen] =
    useState(false);
  const [chainSelectorModalOpen, setChainSelectorModalOpen] = useState(false);
  const [assetSelectorModalOpen, setAssetSelectorModalOpen] = useState(false);
  const [customAddressActive, setCustomAddressActive] = useState(false);
  const [memo, setMemo] = useState<undefined | string>("");
  const [customAddress, setCustomAddress] = useState<undefined | string>("");
  const [amount, setAmount] = useState(new BigNumber(0));

  return (
    <>
      <section className="max-w-[480px] mx-auto" role="widget">
        <Stack as="form">
          <TransferSource
            isConnected={isConnected}
            asset={selectedAsset}
            chain={sourceChain}
            openProviderSelector={() => setProviderSelectorModalOpen(true)}
            openChainSelector={() => setChainSelectorModalOpen(true)}
            openAssetSelector={() => setAssetSelectorModalOpen(true)}
            amount={amount}
            onChangeAmount={(e) =>
              setAmount(e.target.value || new BigNumber(0))
            }
          />
          <TransferDestination
            chain={destinationChain}
            isShielded={isShielded}
            onChangeShielded={onChangeShielded}
            address={customAddress}
            onToggleCustomAddress={
              enableCustomAddress ? setCustomAddressActive : undefined
            }
            customAddressActive={customAddressActive}
            onChangeAddress={setCustomAddress}
            memo={memo}
            onChangeMemo={setMemo}
          />
          {chainSelectorModalOpen && <div />}
          {assetSelectorModalOpen && <div />}
        </Stack>
      </section>
      {providerSelectorModalOpen && (
        <SelectProviderModal
          providers={[{ name: "Keplr", iconUrl: "", connected: false }]}
          onClose={() => setProviderSelectorModalOpen(false)}
          onConnect={() => {}}
        />
      )}
    </>
  );
};
