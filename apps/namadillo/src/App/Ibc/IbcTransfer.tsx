import { Asset, Chain } from "@chain-registry/types";
import { Window as KeplrWindow } from "@keplr-wallet/types";
import { mapUndefined } from "@namada/utils";
import { TransactionTimeline } from "App/Common/TransactionTimeline";
import {
  OnSubmitTransferParams,
  TransferModule,
} from "App/Transfer/TransferModule";
import { allDefaultAccountsAtom } from "atoms/accounts";
import {
  availableChainsAtom,
  chainRegistryAtom,
  ibcTransferAtom,
} from "atoms/integrations";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useAssetAmount } from "hooks/useAssetAmount";
import { useWalletManager } from "hooks/useWalletManager";
import { wallets } from "integrations";
import { KeplrWalletManager } from "integrations/Keplr";
import { useAtomValue } from "jotai";
import { useEffect, useMemo, useState } from "react";
import namadaChain from "registry/namada.json";
import { IbcTopHeader } from "./IbcTopHeader";

import * as cosmos from "chain-registry/mainnet/cosmoshub";
import { getTransactionFee } from "integrations/utils";

const keplr = new KeplrWalletManager();
const defaultChainId = "cosmoshub-4";

export const IbcTransfer: React.FC = () => {
  const chainRegistry = useAtomValue(chainRegistryAtom);
  const availableChains = useAtomValue(availableChainsAtom);
  const [shielded, setShielded] = useState<boolean>(true);
  const [selectedAsset, setSelectedAsset] = useState<Asset>();
  const [currentStep, setCurrentStep] = useState(0);
  const [generalErrorMessage, setGeneralErrorMessage] = useState("");
  const performIbcTransfer = useAtomValue(ibcTransferAtom);
  const defaultAccounts = useAtomValue(allDefaultAccountsAtom);
  const {
    registry,
    walletAddress: sourceAddress,
    connectToChainId,
    chainId,
  } = useWalletManager(keplr);

  const {
    balance: availableAmount,
    availableAssets,
    isLoading: isLoadingBalances,
  } = useAssetAmount({
    registry,
    asset: selectedAsset,
    walletAddress: sourceAddress,
  });

  const transactionFee = useMemo(() => {
    if (typeof registry !== "undefined") {
      return getTransactionFee(registry);
    }
    return undefined;
  }, [registry]);

  useEffect(() => {
    setSelectedAsset(undefined);
  }, [registry]);

  const namadaAddress = useMemo(() => {
    return (
      defaultAccounts.data?.find((account) => account.isShielded === shielded)
        ?.address || ""
    );
  }, [defaultAccounts, shielded]);

  const onSubmitTransfer = async ({
    amount,
    destinationAddress,
    ibcOptions,
  }: OnSubmitTransferParams): Promise<void> => {
    try {
      setGeneralErrorMessage("");
      setCurrentStep(1);

      if (typeof sourceAddress === "undefined") {
        throw new Error("Source address is not defined");
      }

      if (!chainId) {
        throw new Error("Chain ID is undefined");
      }

      if (!selectedAsset) {
        throw new Error("No asset is selected");
      }

      if (!registry) {
        throw new Error("Invalid chain");
      }

      if (!ibcOptions?.sourceChannel) {
        throw new Error("Invalid IBC source channel");
      }

      if (shielded && !ibcOptions.destinationChannel) {
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
        await performIbcTransfer.mutateAsync({
          chain: registry.chain,
          transferParams: {
            signer: keplr.getSigner(chainId),
            sourceAddress,
            destinationAddress,
            amount,
            asset: selectedAsset,
            transactionFee,
            sourceChannelId: ibcOptions.sourceChannel,
            ...(shielded ?
              {
                isShielded: true,
                destinationChannelId: ibcOptions.destinationChannel,
              }
            : {
                isShielded: false,
              }),
          },
        });
      } finally {
        // Restore Keplr options to avoid mutating state
        baseKeplr.defaultOptions = savedKeplrOptions;
      }

      setCurrentStep(2);
    } catch (err) {
      setGeneralErrorMessage(err + "");
      setCurrentStep(0);
    }
  };

  const onChangeWallet = (): void => {
    connectToChainId(chainId || defaultChainId);
  };

  const onChangeChain = (chain: Chain): void => {
    connectToChainId(chain.chain_id);
  };

  return (
    <>
      <header className="flex flex-col items-center text-center mb-3 gap-6">
        <IbcTopHeader type="ibcToNam" isShielded={shielded} />
        <h2 className="text-lg">IBC Transfer to Namada</h2>
      </header>
      <AnimatePresence>
        {currentStep === 0 && (
          <motion.div
            key="transfer"
            exit={{ opacity: 0 }}
            className="min-h-[600px]"
          >
            <TransferModule
              source={{
                isLoadingAssets: isLoadingBalances,
                availableAssets,
                selectedAsset,
                availableAmount,
                availableChains,
                onChangeChain,
                chain: mapUndefined((id) => chainRegistry[id].chain, chainId),
                availableWallets: [wallets.keplr!],
                wallet: wallets.keplr,
                walletAddress: sourceAddress,
                onChangeWallet,
                onChangeSelectedAsset: setSelectedAsset,
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
              errorMessage={generalErrorMessage}
              onSubmitTransfer={onSubmitTransfer}
            />
          </motion.div>
        )}
        {currentStep > 0 && (
          <motion.div
            key="progress"
            className={clsx("my-12", { "text-yellow": shielded })}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <TransactionTimeline
              currentStepIndex={currentStep}
              steps={[
                {
                  children: (
                    <img src={cosmos.chain.logo_URIs?.svg} className="w-14" />
                  ),
                },
                { children: "Signature Required", bullet: true },
                { children: "IBC Transfer to Namada", bullet: true },
                {
                  children: (
                    <>
                      <img
                        src={cosmos.chain.logo_URIs?.svg}
                        className="w-14 mb-2"
                      />
                      Unshielded Transfer Complete
                    </>
                  ),
                },
              ]}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
