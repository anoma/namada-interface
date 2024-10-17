import { Asset, Chain } from "@chain-registry/types";
import { Window as KeplrWindow } from "@keplr-wallet/types";
import { mapUndefined } from "@namada/utils";
import { TransactionTimeline } from "App/Common/TransactionTimeline";
import { TransferModule } from "App/Transfer/TransferModule";
import { allDefaultAccountsAtom } from "atoms/accounts";
import {
  assetBalanceAtomFamily,
  ibcTransferAtom,
  knownChainsAtom,
  selectedIBCChainAtom,
} from "atoms/integrations";
import BigNumber from "bignumber.js";
import { AnimatePresence, motion } from "framer-motion";
import { wallets } from "integrations";
import { useAtom, useAtomValue } from "jotai";
import { useMemo, useState } from "react";
import namadaChain from "registry/namada.json";
import { ChainRegistryEntry, WalletProvider } from "types";
import { basicConvertToKeplrChain } from "utils/integration";
import { IbcTopHeader } from "./IbcTopHeader";

import * as cosmos from "chain-registry/mainnet/cosmoshub";

const keplr = (window as KeplrWindow).keplr!;

export const IbcTransfer: React.FC = () => {
  const knownChains = useAtomValue(knownChainsAtom);
  const [chainId, setChainId] = useAtom(selectedIBCChainAtom);
  const [registry, setRegistry] = useState<ChainRegistryEntry>();
  const [sourceAddress, setSourceAddress] = useState<string | undefined>();
  const [shielded, setShielded] = useState<boolean>(true);
  const [selectedAsset, setSelectedAsset] = useState<Asset>();
  const [sourceChannelId, setSourceChannelId] = useState<string>("");
  const [destinationChannelId, setDestinationChannelId] = useState<string>("");
  const [currentStep, setCurrentStep] = useState(0);
  const performIbcTransfer = useAtomValue(ibcTransferAtom);
  const defaultAccounts = useAtomValue(allDefaultAccountsAtom);

  const { data: assetsBalances, isLoading: isLoadingBalances } = useAtomValue(
    assetBalanceAtomFamily({
      chain: registry?.chain,
      assets: registry?.assets,
      sourceAddress,
    })
  );

  const knownChainsMap = useMemo(() => {
    const map: Record<string, ChainRegistryEntry> = {};
    knownChains.forEach((chain) => {
      map[chain.chain.chain_id] = chain;
    });
    return map;
  }, [knownChains]);

  const namadaAddress = useMemo(() => {
    return (
      defaultAccounts.data?.find((account) => account.isShielded === shielded)
        ?.address || ""
    );
  }, [defaultAccounts, shielded]);

  const onChangeWallet = async (wallet: WalletProvider): Promise<void> => {
    if (wallet.id === "keplr") {
      connectToChainId(chainId || "cosmoshub-4");
    }
  };

  const findRegistryByChainId = (
    chainId: string
  ): ChainRegistryEntry | undefined => {
    return knownChains.find(
      (registry: ChainRegistryEntry) => registry.chain.chain_id === chainId
    );
  };

  const connectToChainId = async (chainId: string): Promise<void> => {
    const registry = findRegistryByChainId(chainId);
    if (registry) {
      try {
        await keplr.experimentalSuggestChain(
          basicConvertToKeplrChain(registry.chain, registry.assets.assets)
        );
        await updateAddress();
        setChainId(registry.chain.chain_id);
        setRegistry(registry);
      } catch {
        // TODO: replace this by an error warning in the component
        alert("Error connecting to chain");
      }
    }
  };

  const updateAddress = async (): Promise<void> => {
    if (typeof chainId !== "undefined") {
      try {
        const keplrKey = await keplr.getKey(chainId);
        setSourceAddress(keplrKey.bech32Address);
      } catch {
        // TODO: replace this alert by an error warning in the component
        alert("Error updating address");
      }
    }
  };

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

      const rpc = knownChainsMap[chainId]?.chain.apis?.rpc?.[0]?.address;
      if (typeof rpc === "undefined") {
        throw new Error("no RPC info for " + chainId);
      }

      if (!selectedAsset) {
        throw new Error("no asset is selected");
      }

      if (!registry) {
        throw new Error("Invalid chain");
      }

      const signer = keplr.getOfflineSigner(registry.chain.chain_id);
      performIbcTransfer.mutateAsync({
        chain: registry.chain,
        transferParams: {
          signer,
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

  const availableAmount = useMemo(() => {
    if (
      !selectedAsset ||
      !assetsBalances ||
      !(selectedAsset.base in assetsBalances)
    ) {
      return undefined;
    }
    return assetsBalances[selectedAsset.base].balance;
  }, [selectedAsset, assetsBalances]);

  return (
    <>
      <header className="flex flex-col items-center text-center mb-3 gap-6">
        <IbcTopHeader type="ibcToNam" isShielded={shielded} />
        <h2>IBC Transfer to Namada</h2>
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
                availableAssets:
                  Object.values(assetsBalances || {}).map((el) => el.asset) ||
                  [],
                selectedAsset,
                onChangeSelectedAsset: setSelectedAsset,
                availableAmount,
                availableChains: knownChains.map((entry) => entry.chain),
                onChangeChain: (chain: Chain) =>
                  connectToChainId(chain.chain_id),
                chain: mapUndefined((id) => knownChainsMap[id].chain, chainId),
                availableWallets: [wallets.keplr!],
                wallet: wallets.keplr,
                walletAddress: sourceAddress,
                onChangeWallet,
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
