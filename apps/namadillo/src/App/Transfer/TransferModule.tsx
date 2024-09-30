import { Asset, Chain, Chains } from "@chain-registry/types";
import { ActionButton, Stack } from "@namada/components";
import BigNumber from "bignumber.js";
import { useState } from "react";
import { WalletProvider } from "types";
import { SelectAssetModal } from "./SelectAssetModal";
import { SelectChainModal } from "./SelectChainModal";
import { SelectWalletModal } from "./SelectWalletModal";
import { TransferArrow } from "./TransferArrow";
import { TransferDestination } from "./TransferDestination";
import { TransferSource } from "./TransferSource";

type TransferModuleProps = {
  isConnected: boolean;
  availableAmount?: BigNumber;
  availableWallets: WalletProvider[];
  onSubmitTransfer: () => void;
  onChangeWallet?: (wallet: WalletProvider) => void;
  sourceWallet?: WalletProvider;
  availableSourceChains?: Chains;
  sourceChain?: Chain;
  onChangeSourceChain?: (chain: Chain) => void;
  availableDestinationChains?: Chains;
  destinationChain?: Chain;
  destinationWallet?: WalletProvider;
  onChangeDestinationChain?: (chain: Chain) => void;
  selectedAsset?: Asset;
  availableAssets?: Asset[];
  onChangeSelectedAsset?: (asset: Asset | undefined) => void;
  isShielded?: boolean;
  onChangeShielded?: (isShielded: boolean) => void;
  enableCustomAddress?: boolean;
  transactionFee?: BigNumber;
};

export const TransferModule = ({
  isConnected,
  selectedAsset,
  availableAssets,
  onChangeSelectedAsset,
  availableSourceChains,
  sourceChain,
  onChangeSourceChain,
  availableDestinationChains,
  destinationChain,
  destinationWallet,
  onChangeDestinationChain,
  isShielded,
  onChangeShielded,
  enableCustomAddress,
  onChangeWallet,
  availableWallets,
  sourceWallet,
  availableAmount,
  transactionFee,
}: TransferModuleProps): JSX.Element => {
  const [providerSelectorModalOpen, setProviderSelectorModalOpen] =
    useState(false);
  const [sourceChainModalOpen, setSourceChainModalOpen] = useState(false);
  const [destinationChainModalOpen, setDestinationChainModalOpen] =
    useState(false);
  const [assetSelectorModalOpen, setAssetSelectorModalOpen] = useState(false);
  const [customAddressActive, setCustomAddressActive] = useState(false);
  const [memo, setMemo] = useState<undefined | string>("");
  const [customAddress, setCustomAddress] = useState<undefined | string>("");
  const [amount, setAmount] = useState<BigNumber | undefined>(new BigNumber(0));

  const validateTransfer = (): boolean => {
    if (!amount || amount.eq(0)) return false;
    if (!sourceWallet || !sourceChain || !selectedAsset) return false;
    if (!destinationWallet || !destinationChain) return false;
    if (
      !availableAmount ||
      availableAmount.lt(amount.plus(transactionFee || 0))
    ) {
      return false;
    }
    return true;
  };

  const onSubmit = (e: React.FormEvent): void => {
    // TODO: implement submit
    e.preventDefault();
  };

  return (
    <>
      <section className="max-w-[480px] mx-auto" role="widget">
        <Stack as="form" onSubmit={onSubmit}>
          <TransferSource
            isConnected={isConnected}
            asset={selectedAsset}
            chain={sourceChain}
            wallet={sourceWallet}
            openProviderSelector={() => setProviderSelectorModalOpen(true)}
            openChainSelector={() => setSourceChainModalOpen(true)}
            openAssetSelector={() => setAssetSelectorModalOpen(true)}
            amount={amount}
            availableAmount={availableAmount}
            onChangeAmount={setAmount}
          />
          <i className="flex items-center justify-center w-11 mx-auto -my-8 relative z-10">
            <TransferArrow color={isShielded ? "#FF0" : "#FFF"} />
          </i>
          <TransferDestination
            chain={destinationChain}
            wallet={destinationWallet}
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
            transactionFee={transactionFee}
          />
          <ActionButton
            backgroundColor={isShielded ? "yellow" : "white"}
            disabled={!sourceWallet || !validateTransfer()}
          >
            {sourceWallet ? "Submit" : "Select Wallet"}
          </ActionButton>
        </Stack>
      </section>
      {providerSelectorModalOpen && onChangeWallet && (
        <SelectWalletModal
          wallets={availableWallets}
          onClose={() => setProviderSelectorModalOpen(false)}
          onConnect={onChangeWallet}
        />
      )}
      {sourceChainModalOpen && onChangeSourceChain && sourceWallet && (
        <SelectChainModal
          onClose={() => setSourceChainModalOpen(false)}
          chains={availableSourceChains || []}
          onSelect={onChangeSourceChain}
        />
      )}
      {destinationChainModalOpen &&
        onChangeDestinationChain &&
        destinationWallet && (
          <SelectChainModal
            onClose={() => setDestinationChainModalOpen(false)}
            chains={availableDestinationChains || []}
            onSelect={onChangeDestinationChain}
          />
        )}
      {assetSelectorModalOpen && onChangeSelectedAsset && sourceWallet && (
        <SelectAssetModal
          onClose={() => setAssetSelectorModalOpen(false)}
          assets={availableAssets || []}
          onSelect={onChangeSelectedAsset}
        />
      )}
    </>
  );
};
