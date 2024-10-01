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

export type TransferModuleConfig = {
  wallet?: WalletProvider;
  availableWallets: WalletProvider[];
  onChangeWallet?: (wallet: WalletProvider) => void;
  connected?: boolean;
  availableChains?: Chains;
  chain?: Chain;
  onChangeChain?: (chain: Chain) => void;
  isShielded?: boolean;
};

export type TransferSourceProps = TransferModuleConfig & {
  availableAssets?: Asset[];
  selectedAsset?: Asset;
  availableAmount?: BigNumber;
  onChangeSelectedAsset?: (asset: Asset | undefined) => void;
};

type TransferDestinationProps = TransferModuleConfig & {
  enableCustomAddress?: boolean;
  onChangeShielded?: (shielded: boolean) => void;
};

type TransferModuleProps = {
  source: TransferSourceProps;
  destination: TransferDestinationProps;
  transactionFee?: BigNumber;
  onSubmitTransfer: () => void;
};

export const TransferModule = ({
  source,
  destination,
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
    if (!source.wallet || !source.chain || !source.selectedAsset) return false;
    if (!destination.wallet || !destination.chain) return false;
    if (
      !source.availableAmount ||
      source.availableAmount.lt(amount.plus(transactionFee || 0))
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
            isConnected={Boolean(source.connected)}
            asset={source.selectedAsset}
            chain={source.chain}
            wallet={source.wallet}
            availableAmount={source.availableAmount}
            amount={amount}
            openProviderSelector={() => setProviderSelectorModalOpen(true)}
            openChainSelector={() => setSourceChainModalOpen(true)}
            openAssetSelector={() => setAssetSelectorModalOpen(true)}
            onChangeAmount={setAmount}
          />
          <i className="flex items-center justify-center w-11 mx-auto -my-8 relative z-10">
            <TransferArrow color={destination.isShielded ? "#FF0" : "#FFF"} />
          </i>
          <TransferDestination
            chain={destination.chain}
            wallet={destination.wallet}
            isShielded={destination.isShielded}
            onChangeShielded={destination.onChangeShielded}
            address={customAddress}
            onToggleCustomAddress={
              destination.enableCustomAddress ?
                setCustomAddressActive
              : undefined
            }
            customAddressActive={customAddressActive}
            onChangeAddress={setCustomAddress}
            memo={memo}
            onChangeMemo={setMemo}
            transactionFee={transactionFee}
          />
          <ActionButton
            backgroundColor={
              destination.isShielded || source.isShielded ? "yellow" : "white"
            }
            disabled={!source.wallet || !validateTransfer()}
          >
            {source.wallet ? "Submit" : "Select Wallet"}
          </ActionButton>
        </Stack>
      </section>

      {providerSelectorModalOpen && source.onChangeWallet && (
        <SelectWalletModal
          wallets={source.availableWallets}
          onClose={() => setProviderSelectorModalOpen(false)}
          onConnect={source.onChangeWallet}
        />
      )}

      {assetSelectorModalOpen &&
        source.onChangeSelectedAsset &&
        source.wallet && (
          <SelectAssetModal
            onClose={() => setAssetSelectorModalOpen(false)}
            assets={source.availableAssets || []}
            onSelect={source.onChangeSelectedAsset}
          />
        )}

      {sourceChainModalOpen && source.onChangeChain && source.wallet && (
        <SelectChainModal
          onClose={() => setSourceChainModalOpen(false)}
          chains={source.availableChains || []}
          onSelect={source.onChangeChain}
        />
      )}

      {destinationChainModalOpen &&
        destination.onChangeChain &&
        destination.wallet && (
          <SelectChainModal
            onClose={() => setDestinationChainModalOpen(false)}
            chains={destination.availableChains || []}
            onSelect={destination.onChangeChain}
          />
        )}

      {assetSelectorModalOpen &&
        source.onChangeSelectedAsset &&
        source.wallet && (
          <SelectAssetModal
            onClose={() => setAssetSelectorModalOpen(false)}
            assets={source.availableAssets || []}
            onSelect={source.onChangeSelectedAsset}
          />
        )}
    </>
  );
};
