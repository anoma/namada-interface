import { Window as KeplrWindow } from "@keplr-wallet/types";
import { Panel } from "@namada/components";
import { mapUndefined } from "@namada/utils";
import { TransferModule } from "App/Transfer/TransferModule";
import BigNumber from "bignumber.js";
import { wallets } from "integrations";
import { useEffect, useMemo, useState } from "react";
import { ChainRegistryEntry, WalletProvider } from "types";

import { allDefaultAccountsAtom } from "atoms/accounts";

import { useAtom, useAtomValue } from "jotai";
import namadaChain from "registry/namada.json";

import { Asset, Chain } from "@chain-registry/types";
import {
  assetBalanceAtomFamily,
  ibcTransferAtom,
  knownChainsAtom,
  selectedIBCChainAtom,
} from "atoms/integrations";
import { basicConvertToKeplrChain } from "utils/integration";

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
  const performIbcTransfer = useAtomValue(ibcTransferAtom);
  const defaultAccounts = useAtomValue(allDefaultAccountsAtom);

  const transactionFee = useMemo(() => {
    if (typeof registry !== "undefined") {
      // TODO: can we get a better type for registry to avoid optional chaining?
      // TODO: some chains support multiple fee tokens - what should we do?
      const feeToken = registry.chain?.fees?.fee_tokens?.[0];

      if (typeof feeToken !== "undefined") {
        const asset = registry.assets.assets.find(
          (asset) => asset.base === feeToken.denom
        );

        if (typeof asset !== "undefined") {
          return {
            amount: BigNumber(1), // TODO: remove hardcoding
            token: asset,
          };
        }
      }
    }

    return undefined;
  }, [registry]);

  useEffect(() => {
    setSelectedAsset(undefined);
    chainId && connectToChainId(chainId);
  }, [chainId]);

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

  const onSubmitTransfer = (
    amount: BigNumber,
    destinationAddress: string
  ): void => {
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

    if (typeof transactionFee === "undefined") {
      throw new Error("No transaction fee is set");
    }

    performIbcTransfer.mutateAsync({
      chain: registry.chain,
      transferParams: {
        keplr,
        sourceChainId: chainId,
        sourceAddress,
        destinationAddress,
        amount,
        token: selectedAsset.base,
        transactionFee,
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
  };

  const availableAmount = useMemo(() => {
    if (
      !selectedAsset ||
      !assetsBalances ||
      !(selectedAsset.base in assetsBalances) ||
      typeof transactionFee === "undefined"
    ) {
      return undefined;
    }

    const totalAmount = assetsBalances[selectedAsset.base].balance;

    if (
      typeof totalAmount !== "undefined" &&
      selectedAsset.base === transactionFee.token.base
    ) {
      return totalAmount.minus(transactionFee.amount);
    } else {
      return totalAmount;
    }
  }, [selectedAsset, assetsBalances]);

  return (
    <Panel>
      <header className="text-center mb-4">
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
      <TransferModule
        source={{
          isLoadingAssets: isLoadingBalances,
          availableAssets:
            Object.values(assetsBalances || {}).map((el) => el.asset) || [],
          selectedAsset,
          onChangeSelectedAsset: setSelectedAsset,
          availableAmount,
          availableChains: knownChains.map((entry) => entry.chain),
          onChangeChain: (chain: Chain) => connectToChainId(chain.chain_id),
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
        transactionFee={transactionFee}
        isSubmitting={performIbcTransfer.isPending}
        onSubmitTransfer={onSubmitTransfer}
      />
    </Panel>
  );
};
