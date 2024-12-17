import { Chain } from "@chain-registry/types";
import { AccountType } from "@namada/types";
import { mapUndefined } from "@namada/utils";
import { TransferTransactionTimeline } from "App/Transactions/TransferTransactionTimeline";
import {
  OnSubmitTransferParams,
  TransferModule,
} from "App/Transfer/TransferModule";
import { allDefaultAccountsAtom } from "atoms/accounts";
import {
  assetBalanceAtomFamily,
  availableChainsAtom,
  ibcChannelsFamily,
} from "atoms/integrations";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { useIbcTransaction } from "hooks/useIbcTransaction";
import { useTransactionActions } from "hooks/useTransactionActions";
import { useWalletManager } from "hooks/useWalletManager";
import { wallets } from "integrations";
import { KeplrWalletManager } from "integrations/Keplr";
import { useAtomValue } from "jotai";
import { useEffect, useMemo, useState } from "react";
import namadaChain from "registry/namada.json";
import { Address, PartialTransferTransactionData, TransferStep } from "types";
import { IbcTopHeader } from "./IbcTopHeader";

const keplr = new KeplrWalletManager();
const defaultChainId = "cosmoshub-4";

export const IbcTransfer = (): JSX.Element => {
  // Global & Atom states
  const availableChains = useAtomValue(availableChainsAtom);
  const defaultAccounts = useAtomValue(allDefaultAccountsAtom);

  // Wallet & Registry
  const {
    registry,
    walletAddress: sourceAddress,
    connectToChainId,
  } = useWalletManager(keplr);

  // IBC Channels & Balances
  const { data: ibcChannels } = useAtomValue(
    ibcChannelsFamily(registry?.chain.chain_name)
  );

  const { data: userAssets, isLoading: isLoadingBalances } = useAtomValue(
    assetBalanceAtomFamily({
      chain: registry?.chain,
      walletAddress: sourceAddress,
    })
  );

  // Local State
  const [shielded, setShielded] = useState<boolean>(true);
  const [selectedAssetAddress, setSelectedAssetAddress] = useState<Address>();
  const [amount, setAmount] = useState<BigNumber | undefined>();
  const [generalErrorMessage, setGeneralErrorMessage] = useState("");
  const [sourceChannel, setSourceChannel] = useState("");
  const [destinationChannel, setDestinationChannel] = useState("");
  const [transaction, setTransaction] =
    useState<PartialTransferTransactionData>();

  // Derived data
  const availableAmount = mapUndefined(
    (address) => userAssets?.[address]?.amount,
    selectedAssetAddress
  );

  const selectedAsset = mapUndefined(
    (address) => userAssets?.[address],
    selectedAssetAddress
  );

  // Manage the history of transactions
  const { findByHash, storeTransaction } = useTransactionActions();

  // Utils for IBC transfers
  const { transferToNamada, gasConfig } = useIbcTransaction({
    registry,
    sourceAddress,
    sourceChannel,
    destinationChannel,
    shielded,
    selectedAsset,
  });

  const namadaAddress = useMemo(() => {
    return (
      defaultAccounts.data?.find(
        (account) => (account.type === AccountType.ShieldedKeys) === shielded
      )?.address || ""
    );
  }, [defaultAccounts, shielded]);

  const requiresIbcChannels =
    !ibcChannels?.cosmosChannelId ||
    (shielded && !ibcChannels?.namadaChannelId);

  useEffect(() => setSelectedAssetAddress(undefined), [registry]);

  // Update transaction if its hash is known and it exists in stored transactions
  useEffect(() => {
    if (transaction?.hash) {
      const tx = findByHash(transaction.hash);
      tx && setTransaction(tx);
    }
  }, [transaction?.hash, findByHash]);

  // Set source and destination channels based on IBC channels data
  useEffect(() => {
    setSourceChannel(ibcChannels?.cosmosChannelId || "");
    setDestinationChannel(ibcChannels?.namadaChannelId || "");
  }, [ibcChannels]);

  const onSubmitTransfer = async ({
    displayAmount,
    destinationAddress,
  }: OnSubmitTransferParams): Promise<void> => {
    try {
      setGeneralErrorMessage("");
      const txPromise = transferToNamada(destinationAddress, displayAmount);
      setTransaction({
        type: shielded ? "IbcToShielded" : "IbcToTransparent",
        asset: selectedAsset!.asset,
        chainId: registry!.chain.chain_id,
        currentStep: TransferStep.Sign,
      });
      const result = await txPromise;
      setTransaction(result);
      storeTransaction(result);
    } catch (err) {
      setGeneralErrorMessage(err + "");
      setTransaction(undefined);
    }
  };

  const onChangeWallet = (): void => {
    if (registry) {
      connectToChainId(registry.chain.chain_id);
      return;
    }
    connectToChainId(defaultChainId);
  };

  const onChangeChain = (chain: Chain): void => {
    connectToChainId(chain.chain_id);
  };

  return (
    <>
      <div className="relative min-h-[600px]">
        {!transaction && (
          <>
            <header className="flex flex-col items-center text-center mb-3 gap-6">
              <IbcTopHeader type="ibcToNam" isShielded={shielded} />
              <h2 className="text-lg">IBC Transfer to Namada</h2>
            </header>
            <TransferModule
              source={{
                isLoadingAssets: isLoadingBalances,
                availableAssets: userAssets,
                selectedAssetAddress,
                availableAmount,
                availableChains,
                onChangeChain,
                chain: registry?.chain,
                availableWallets: [wallets.keplr],
                wallet: wallets.keplr,
                walletAddress: sourceAddress,
                onChangeWallet,
                onChangeSelectedAsset: setSelectedAssetAddress,
                amount,
                onChangeAmount: setAmount,
              }}
              destination={{
                chain: namadaChain as Chain,
                availableWallets: [wallets.namada],
                wallet: wallets.namada,
                walletAddress: namadaAddress,
                isShielded: shielded,
                onChangeShielded: setShielded,
              }}
              gasConfig={gasConfig}
              isSubmitting={transferStatus === "pending"}
              isIbcTransfer={true}
              requiresIbcChannels={requiresIbcChannels}
              ibcOptions={{
                sourceChannel,
                onChangeSourceChannel: setSourceChannel,
                destinationChannel,
                onChangeDestinationChannel: setDestinationChannel,
              }}
              errorMessage={generalErrorMessage}
              onSubmitTransfer={onSubmitTransfer}
            />
          </>
        )}
        {transaction && (
          <div
            className={clsx("absolute z-50 py-12 left-0 top-0 w-full h-full", {
              "text-yellow": shielded,
            })}
          >
            <TransferTransactionTimeline transaction={transaction} />
          </div>
        )}
      </div>
    </>
  );
};
