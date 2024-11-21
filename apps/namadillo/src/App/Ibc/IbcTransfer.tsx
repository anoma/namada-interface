import { Chain } from "@chain-registry/types";
import { Window as KeplrWindow } from "@keplr-wallet/types";
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
  chainRegistryAtom,
  ibcChannelsFamily,
  ibcTransferAtom,
} from "atoms/integrations";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { useTransactionActions } from "hooks/useTransactionActions";
import { useWalletManager } from "hooks/useWalletManager";
import { wallets } from "integrations";
import { KeplrWalletManager } from "integrations/Keplr";
import { getTransactionFee } from "integrations/utils";
import { useAtomValue } from "jotai";
import { useEffect, useMemo, useState } from "react";
import namadaChain from "registry/namada.json";
import { Address, PartialTransferTransactionData, TransferStep } from "types";
import { IbcTopHeader } from "./IbcTopHeader";

const keplr = new KeplrWalletManager();
const defaultChainId = "cosmoshub-4";

export const IbcTransfer: React.FC = () => {
  const chainRegistry = useAtomValue(chainRegistryAtom);
  const availableChains = useAtomValue(availableChainsAtom);
  const [shielded, setShielded] = useState<boolean>(true);
  const [selectedAssetAddress, setSelectedAssetAddress] = useState<Address>();
  const [amount, setAmount] = useState<BigNumber | undefined>();
  const [generalErrorMessage, setGeneralErrorMessage] = useState("");
  const [sourceChannel, setSourceChannel] = useState("");
  const [destinationChannel, setDestinationChannel] = useState("");

  const performIbcTransfer = useAtomValue(ibcTransferAtom);
  const defaultAccounts = useAtomValue(allDefaultAccountsAtom);
  const {
    registry,
    walletAddress: sourceAddress,
    connectToChainId,
    chainId,
  } = useWalletManager(keplr);

  const [transaction, setTransaction] =
    useState<PartialTransferTransactionData>();

  const {
    transactions: myTransactions,
    findByHash,
    storeTransaction,
  } = useTransactionActions();

  const { data: availableAssets, isLoading: isLoadingBalances } = useAtomValue(
    assetBalanceAtomFamily({
      chain: registry?.chain,
      walletAddress: sourceAddress,
    })
  );

  const availableAmount = mapUndefined(
    (address) => availableAssets?.[address]?.amount,
    selectedAssetAddress
  );

  const transactionFee = useMemo(() => {
    if (typeof registry !== "undefined") {
      return getTransactionFee(registry);
    }
    return undefined;
  }, [registry]);

  useEffect(() => {
    setSelectedAssetAddress(undefined);
  }, [registry]);

  useEffect(() => {
    if (transaction?.hash) {
      const tx = findByHash(transaction.hash);
      if (tx) {
        setTransaction(tx);
      }
    }
  }, [myTransactions]);

  const namadaAddress = useMemo(() => {
    return (
      defaultAccounts.data?.find((account) => account.isShielded === shielded)
        ?.address || ""
    );
  }, [defaultAccounts, shielded]);

  const { data: ibcChannels } = useAtomValue(
    ibcChannelsFamily(registry?.chain.chain_name)
  );

  useEffect(() => {
    setSourceChannel(ibcChannels?.cosmosChannelId || "");
    setDestinationChannel(ibcChannels?.namadaChannelId || "");
  }, [ibcChannels]);

  const onSubmitTransfer = async ({
    amount,
    destinationAddress,
  }: OnSubmitTransferParams): Promise<void> => {
    try {
      setGeneralErrorMessage("");

      if (typeof sourceAddress === "undefined") {
        throw new Error("Source address is not defined");
      }

      if (!chainId) {
        throw new Error("Chain ID is undefined");
      }

      const selectedAsset = mapUndefined(
        (address) => availableAssets?.[address],
        selectedAssetAddress
      );

      if (!selectedAsset) {
        throw new Error("No asset is selected");
      }

      if (!registry) {
        throw new Error("Invalid chain");
      }

      if (!sourceChannel) {
        throw new Error("Invalid IBC source channel");
      }

      if (shielded && !destinationChannel) {
        throw new Error("Invalid IBC destination channel");
      }

      if (typeof transactionFee === "undefined") {
        throw new Error("No transaction fee is set");
      }

      const baseKeplr = (window as KeplrWindow).keplr;

      if (typeof baseKeplr === "undefined") {
        throw new Error("No Keplr instance");
      }

      // Set Keplr option to allow Namadillo to set the transaction fee
      const savedKeplrOptions = baseKeplr.defaultOptions;
      baseKeplr.defaultOptions = {
        sign: {
          preferNoSetFee: true,
        },
      };

      try {
        setTransaction({
          type: shielded ? "IbcToShielded" : "IbcToTransparent",
          asset: selectedAsset.asset,
          chainId,
          currentStep: TransferStep.Sign,
        });

        const tx = await performIbcTransfer.mutateAsync({
          chain: registry.chain,
          transferParams: {
            signer: await keplr.getSigner(chainId),
            chainId,
            sourceAddress,
            destinationAddress,
            amount,
            asset: selectedAsset,
            transactionFee,
            sourceChannelId: sourceChannel.trim(),
            ...(shielded ?
              {
                isShielded: true,
                destinationChannelId: destinationChannel.trim(),
              }
            : {
                isShielded: false,
              }),
          },
        });
        setTransaction(tx);
        storeTransaction(tx);
      } finally {
        // Restore Keplr options to avoid mutating state
        baseKeplr.defaultOptions = savedKeplrOptions;
      }
    } catch (err) {
      setGeneralErrorMessage(err + "");
      setTransaction(undefined);
    }
  };

  const onChangeWallet = (): void => {
    if (chainId && chainId in chainRegistry) {
      connectToChainId(chainId);
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
                availableAssets,
                selectedAssetAddress,
                availableAmount,
                availableChains,
                onChangeChain,
                chain: mapUndefined((id) => chainRegistry[id]?.chain, chainId),
                availableWallets: [wallets.keplr!],
                wallet: wallets.keplr,
                walletAddress: sourceAddress,
                onChangeWallet,
                onChangeSelectedAsset: setSelectedAssetAddress,
                amount,
                onChangeAmount: setAmount,
              }}
              destination={{
                chain: namadaChain as Chain,
                availableWallets: [wallets.namada!],
                wallet: wallets.namada,
                walletAddress: namadaAddress,
                isShielded: shielded,
                onChangeShielded: setShielded,
              }}
              transactionFee={transactionFee}
              isSubmitting={performIbcTransfer.isPending}
              isIbcTransfer={true}
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
            className={clsx(
              "absolute z-50 py-12 left-0 top-0 w-full h-full bg-black",
              {
                "text-yellow": shielded,
              }
            )}
          >
            <TransferTransactionTimeline transaction={transaction} />
          </div>
        )}
      </div>
    </>
  );
};
