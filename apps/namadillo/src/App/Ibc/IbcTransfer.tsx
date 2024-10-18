import { Asset, Chain } from "@chain-registry/types";
import { mapUndefined } from "@namada/utils";
import { TransactionTimeline } from "App/Common/TransactionTimeline";
import { TransferModule } from "App/Transfer/TransferModule";
import { allDefaultAccountsAtom } from "atoms/accounts";
import { ibcTransferAtom, knownChainsAtom } from "atoms/integrations";
import BigNumber from "bignumber.js";
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

<<<<<<< HEAD
const keplr = new KeplrWalletManager();
=======
//TODO: we need to find a good way to manage IBC channels
const namadaChannelId = "channel-4353";
>>>>>>> 896988f4 (refactor: returning a map instead of a list from knownChainAtom)
const defaultChainId = "cosmoshub-4";
const keplr = new KeplrWalletManager();

export const IbcTransfer: React.FC = () => {
  const knownChains = useAtomValue(knownChainsAtom);
  const [shielded, setShielded] = useState<boolean>(true);
  const [selectedAsset, setSelectedAsset] = useState<Asset>();
  const [sourceChannelId, setSourceChannelId] = useState<string>("");
  const [destinationChannelId, setDestinationChannelId] = useState<string>("");
  const [currentStep, setCurrentStep] = useState(0);
  const performIbcTransfer = useAtomValue(ibcTransferAtom);
  const defaultAccounts = useAtomValue(allDefaultAccountsAtom);
  const {
    registry,
    walletAddress: sourceAddress,
    connectToChainId,
    chainId,
  } = useWalletManager({
    wallet: keplr,
  });

  const {
    balance: availableAmount,
    availableAssets,
    isLoading: isLoadingBalances,
  } = useAssetAmount({
    registry,
    asset: selectedAsset,
    walletAddress: sourceAddress,
  });

  useEffect(() => {
    setSelectedAsset(undefined);
  }, [registry]);

  const namadaAddress = useMemo(() => {
    return (
      defaultAccounts.data?.find((account) => account.isShielded === shielded)
        ?.address || ""
    );
  }, [defaultAccounts, shielded]);

  const onSubmitTransfer = async (
    amount: BigNumber,
    destinationAddress: string
  ): Promise<void> => {
    try {
      setCurrentStep(1);

      if (typeof sourceAddress === "undefined") {
        throw new Error("Source address is not defined");
      }

      if (!chainId) {
        throw new Error("chain ID is undefined");
      }

      if (!selectedAsset) {
        throw new Error("no asset is selected");
      }

      if (!registry) {
        throw new Error("Invalid chain");
      }

      await performIbcTransfer.mutateAsync({
        chain: registry.chain,
        transferParams: {
          signer: keplr.getSigner(chainId),
          sourceAddress,
          destinationAddress,
          amount,
          token: selectedAsset.base,
          sourceChannelId,
          ...(shielded ?
            {
              isShielded: true,
              destinationChannelId,
            }
          : {
              isShielded: false,
            }),
        },
      });
      setCurrentStep(2);
    } catch {
      setCurrentStep(0);
    }
  };

  const onChangeWallet = (): void => {
    connectToChainId(chainId || defaultChainId);
  };

  const onChangeChain = (chain: Chain): void => {
    connectToChainId(chain.chain_id);
  };

  const availableChains = useMemo(
    () => Object.values(knownChains).map((entry) => entry.chain),
    [knownChains]
  );

  return (
    <>
      <header className="flex flex-col items-center text-center mb-3 gap-6">
        <IbcTopHeader type="ibcToNam" isShielded={shielded} />
        <h2 className="text-lg">IBC Transfer to Namada</h2>
      </header>
      <div className="flex flex-col gap-2">
        <input
          className="text-black"
          type="text"
          placeholder="source channel id"
          value={sourceChannelId}
          onChange={(e) => setSourceChannelId(e.target.value)}
        />
        <input
          className="text-black"
          type="text"
          placeholder="destination channel id"
          value={destinationChannelId}
          onChange={(e) => setDestinationChannelId(e.target.value)}
        />
      </div>
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
                chain: mapUndefined((id) => knownChains[id].chain, chainId),
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
              transactionFee={new BigNumber(0.0001) /*TODO: fix this*/}
              isSubmitting={performIbcTransfer.isPending}
              onSubmitTransfer={onSubmitTransfer}
            />
          </motion.div>
        )}
        {currentStep > 0 && (
          <motion.div
            className="my-12"
            key="progress"
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
