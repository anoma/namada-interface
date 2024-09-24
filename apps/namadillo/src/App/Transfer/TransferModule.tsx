import { Chain, Chains } from "@chain-registry/types";
import { Stack } from "@namada/components";
import BigNumber from "bignumber.js";
import { useState } from "react";
import { Asset, WalletProvider } from "types";
import { SelectChainModal } from "./SelectChainModal";
import { SelectWalletModal } from "./SelectWalletModal";
import { TransferDestination } from "./TransferDestination";
import { TransferSource } from "./TransferSource";

type TransferModuleProps = {
  isConnected: boolean;
  availableWallets: WalletProvider[];
  onSubmitTransfer: () => void;
  onChangeWallet?: (wallet: WalletProvider) => void;
  selectedWallet?: WalletProvider;
  availableSourceChains?: Chains;
  sourceChain?: Chain;
  onChangeSourceChain?: (chain: Chain) => void;
  availableDestinationChains?: Chains;
  destinationChain?: Chain;
  onChangeDestinationChain?: (chain: Chain) => void;
  selectedAsset?: Asset;
  onChangeSelectedAsset?: (asset: Asset | undefined) => void;
  isShielded?: boolean;
  onChangeShielded?: (isShielded: boolean) => void;
  enableCustomAddress?: boolean;
};

export const TransferModule = ({
  isConnected,
  selectedAsset,
  availableSourceChains,
  sourceChain,
  onChangeSourceChain,
  availableDestinationChains: availableDestinationChain,
  destinationChain,
  onChangeDestinationChain,
  isShielded,
  onChangeShielded,
  enableCustomAddress,
  onChangeWallet,
  availableWallets,
  selectedWallet,
}: TransferModuleProps): JSX.Element => {
  const [providerSelectorModalOpen, setProviderSelectorModalOpen] =
    useState(false);
  const [sourceChainModalOpen, setSourceChainModalOpen] = useState(false);
  const [destinationChainModalOpen, _setDestinationChainModalOpen] =
    useState(false);
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
            wallet={selectedWallet}
            openProviderSelector={() => setProviderSelectorModalOpen(true)}
            openChainSelector={() => setSourceChainModalOpen(true)}
            openAssetSelector={() => setAssetSelectorModalOpen(true)}
            amount={amount}
            onChangeAmount={(e) =>
              setAmount(e.target.value || new BigNumber(0))
            }
          />
          <TransferDestination
            chain={destinationChain}
            wallet={selectedWallet}
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
        </Stack>
      </section>
      {providerSelectorModalOpen && onChangeWallet && (
        <SelectWalletModal
          wallets={availableWallets}
          onClose={() => setProviderSelectorModalOpen(false)}
          onConnect={onChangeWallet}
        />
      )}
      {sourceChainModalOpen && onChangeSourceChain && (
        <SelectChainModal
          onClose={() => setSourceChainModalOpen(false)}
          chains={availableSourceChains || []}
          onSelect={onChangeSourceChain}
        />
      )}
      {destinationChainModalOpen && onChangeDestinationChain && (
        <SelectChainModal
          onClose={() => setSourceChainModalOpen(false)}
          chains={availableDestinationChain || []}
          onSelect={onChangeDestinationChain}
        />
      )}
      {assetSelectorModalOpen && <div />}
    </>
  );
};
