import { Window as KeplrWindow } from "@keplr-wallet/types";
import { Panel } from "@namada/components";
import { mapUndefined } from "@namada/utils";
import { TransferModule } from "App/Transfer/TransferModule";
import BigNumber from "bignumber.js";
import { wallets } from "integrations";
import { useEffect, useMemo, useState } from "react";
import { ChainRegistryEntry, WalletProvider } from "types";

import * as celestia from "chain-registry/mainnet/celestia";
import * as cosmos from "chain-registry/mainnet/cosmoshub";
import * as dydx from "chain-registry/mainnet/dydx";
import * as osmosis from "chain-registry/mainnet/osmosis";
import * as stargaze from "chain-registry/mainnet/stargaze";

import * as celestiaTestnet from "chain-registry/testnet/celestiatestnet3";
import * as cosmosTestnet from "chain-registry/testnet/cosmoshubtestnet";
import * as dydxTestnet from "chain-registry/testnet/dydxtestnet";
import * as osmosisTestnet from "chain-registry/testnet/osmosistestnet4";
import * as stargazeTestnet from "chain-registry/testnet/stargazetestnet";

import { allDefaultAccountsAtom } from "atoms/accounts";

import { useAtom, useAtomValue } from "jotai";
import namadaChain from "registry/namada.json";

import { Asset, Chain } from "@chain-registry/types";
import { useQuery } from "@tanstack/react-query";
import { ibcTransferAtom, selectedIBCChainAtom } from "atoms/integrations";
import {
  AssetWithBalance,
  mapCoinsToAssets,
  queryAndStoreRpc,
  queryAssetBalances,
} from "atoms/registry";
import { settingsAtom } from "atoms/settings";

const keplr = (window as KeplrWindow).keplr!;

const mainnetChains: Record<string, ChainRegistryEntry> = {
  [celestia.chain.chain_id]: celestia,
  [cosmos.chain.chain_id]: cosmos,
  [dydx.chain.chain_id]: dydx,
  [osmosis.chain.chain_id]: osmosis,
  [stargaze.chain.chain_id]: stargaze,
};

const testnetChains: Record<string, ChainRegistryEntry> = {
  [cosmosTestnet.chain.chain_id]: cosmosTestnet,
  [celestiaTestnet.chain.chain_id]: celestiaTestnet,
  [dydxTestnet.chain.chain_id]: dydxTestnet,
  [osmosisTestnet.chain.chain_id]: osmosisTestnet,
  [stargazeTestnet.chain.chain_id]: stargazeTestnet,
};

export const IbcTransfer: React.FC = () => {
  const settings = useAtomValue(settingsAtom);
  const [chainId, setChainId] = useAtom(selectedIBCChainAtom);
  const [sourceAddress, setSourceAddress] = useState<string | undefined>();
  const [shielded, setShielded] = useState<boolean>(true);
  const [selectedAsset, setSelectedAsset] = useState<Asset>();
  const [sourceChannelId, setSourceChannelId] = useState<string>("");
  const [assetsBalances, setAssetsBalances] = useState<
    Record<string, AssetWithBalance>
  >({});

  const performIbcTransfer = useAtomValue(ibcTransferAtom);

  const defaultAccounts = useAtomValue(allDefaultAccountsAtom);

  const knownChains: Record<string, ChainRegistryEntry> =
    settings.enableTestnets ?
      { ...mainnetChains, ...testnetChains }
    : mainnetChains;

  const registry = useMemo(() => {
    if (!chainId) return;
    const entry = Object.values(knownChains).find(
      (registry: ChainRegistryEntry) => registry.chain.chain_id === chainId
    );
    return entry;
  }, [chainId]);

  const namadaAddress = useMemo(() => {
    if (!defaultAccounts.data || defaultAccounts.data.length === 0) {
      return "";
    }
    return (
      defaultAccounts.data.find((account) => account.isShielded === shielded)
        ?.address || ""
    );
  }, [defaultAccounts, shielded]);

  // Note: I think we should put this somewhere, but not sure if we need an atom for that :/
  // If we create an atom, we will need an atom family that requires two arguments, address and chain (or rpc).
  // atomFamily only accepts one argument, so we would need to create a ref with an object to keep the same reference
  // on each re-render. Not sure if this overhead is better than breaking
  const assetBalanceQuery = useQuery({
    enabled: Boolean(sourceAddress && registry?.chain),
    queryKey: ["assets", sourceAddress, registry?.chain?.chain_id],
    queryFn: async () => {
      const assetsBalances = await queryAndStoreRpc(
        registry!.chain,
        async (rpc: string) => {
          return await queryAssetBalances(sourceAddress!, rpc);
        }
      );
      const coinsToAssets = mapCoinsToAssets(assetsBalances, registry!.assets);
      setAssetsBalances(coinsToAssets);
    },
  });

  const onChangeWallet = async (wallet: WalletProvider): Promise<void> => {
    if (wallet.id === "keplr") {
      await keplr.enable(chainId || Object.keys(knownChains)[0]);
      setChainId(chainId || Object.keys(knownChains)[0]);
    }
  };

  const updateAddress = async (): Promise<void> => {
    if (typeof chainId !== "undefined") {
      const keplrKey = await keplr.getKey(chainId);
      setSourceAddress(keplrKey.bech32Address);
    }
  };

  useEffect(() => {
    updateAddress();
  }, [chainId]);

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

    const rpc = knownChains[chainId]?.chain.apis?.rpc?.[0]?.address;
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
        channelId: sourceChannelId,
      },
    });
  };

  return (
    <Panel>
      <header className="text-center mb-4">
        <h2>IBC Transfer to Namada</h2>
      </header>

      <input
        className="text-black"
        type="text"
        placeholder="source channel id"
        value={sourceChannelId}
        onChange={(e) => setSourceChannelId(e.target.value)}
      />

      <TransferModule
        source={{
          isLoadingAssets: assetBalanceQuery.isFetching,
          availableAssets:
            Object.values(assetsBalances).map((el) => el.asset) || [],
          selectedAsset,
          onChangeSelectedAsset: setSelectedAsset,
          availableAmount:
            selectedAsset && selectedAsset.base in assetsBalances ?
              assetsBalances[selectedAsset.base].balance
            : undefined,
          availableChains: Object.values(knownChains).map(
            (entry) => entry.chain
          ),
          onChangeChain: (chain) => setChainId(chain.chain_id),
          chain: mapUndefined((id) => knownChains[id].chain, chainId),
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
