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

//TODO: we need to find a good way to manage IBC channels
const namadaChannelId = "channel-4353";

export const IbcTransfer: React.FC = () => {
  const knownChains = useAtomValue(knownChainsAtom);
  const [chainId, setChainId] = useAtom(selectedIBCChainAtom);
  const [registry, setRegistry] = useState<ChainRegistryEntry>();
  const [sourceAddress, setSourceAddress] = useState<string | undefined>();
  const [shielded, setShielded] = useState<boolean>(true);
  const [selectedAsset, setSelectedAsset] = useState<Asset>();
  const performIbcTransfer = useAtomValue(ibcTransferAtom);
  const defaultAccounts = useAtomValue(allDefaultAccountsAtom);

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

    performIbcTransfer.mutateAsync({
      chain: registry.chain,
      transferParams: {
        signer: keplr.getOfflineSigner(registry.chain.chain_id),
        sourceAddress,
        destinationAddress,
        amount,
        token: selectedAsset.base,
        channelId: namadaChannelId,
      },
    });
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
    <Panel>
      <header className="text-center mb-4">
        <h2>IBC Transfer to Namada</h2>
      </header>
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
        transactionFee={new BigNumber(0.0001) /*TODO: fix this*/}
        isSubmitting={performIbcTransfer.isPending}
        onSubmitTransfer={onSubmitTransfer}
      />
    </Panel>
  );
};
