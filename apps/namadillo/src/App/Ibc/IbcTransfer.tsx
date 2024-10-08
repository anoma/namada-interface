import { coin, coins } from "@cosmjs/proto-signing";
import {
  QueryClient,
  SigningStargateClient,
  setupIbcExtension,
} from "@cosmjs/stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { Window as KeplrWindow } from "@keplr-wallet/types";
import { Panel } from "@namada/components";
import { mapUndefined } from "@namada/utils";
import { TransferModule } from "App/Transfer/TransferModule";
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

import { defaultAccountAtom } from "atoms/accounts";

import { useAtom, useAtomValue } from "jotai";
import namadaChain from "registry/namada.json";

import { Asset, Chain } from "@chain-registry/types";
import { useQuery } from "@tanstack/react-query";
import { selectedIBCChainAtom } from "atoms/integrations";
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
  const [address, setAddress] = useState<string | undefined>();
  const [shielded, setShielded] = useState<boolean>(true);
  const [selectedAsset, setSelectedAsset] = useState<Asset>();
  const [sourceChannelId, setSourceChannelId] = useState<string>("");
  const [assetsBalances, setAssetsBalances] = useState<
    Record<string, AssetWithBalance>
  >({});

  const defaultAccount = useAtomValue(defaultAccountAtom);

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

  // Note: I think we should put this somewhere, but not sure if we need an atom for that :/
  // If we create an atom, we will need an atom family that requires two arguments, address and chain (or rpc).
  // atomFamily only accepts one argument, so we would need to create a ref with an object to keep the same reference
  // on each re-render. Not sure if this overhead is better than breaking
  const assetBalanceQuery = useQuery({
    enabled: Boolean(address && registry?.chain),
    queryKey: ["assets", address, registry?.chain?.chain_id],
    queryFn: async () => {
      const assetsBalances = await queryAndStoreRpc(
        registry!.chain,
        async (rpc: string) => {
          return await queryAssetBalances(address!, rpc);
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
      setAddress(keplrKey.bech32Address);
    }
  };

  useEffect(() => {
    updateAddress();
  }, [chainId]);

  const onSubmitTransfer = (): void => {
    if (typeof address === "undefined") {
      throw new Error("Source address is not defined");
    }

    if (
      !defaultAccount.isSuccess ||
      typeof defaultAccount.data === "undefined"
    ) {
      throw new Error("Namada account is not loaded");
    }

    if (typeof chainId === "undefined") {
      throw new Error("chain ID is undefined");
    }

    const rpc = knownChains[chainId]?.chain.apis?.rpc?.[0]?.address;

    if (typeof rpc === "undefined") {
      throw new Error("no RPC info for " + chainId);
    }

    if (typeof selectedAsset === "undefined") {
      throw new Error("no asset is selected");
    }

    submitIbcTransfer(
      rpc,
      chainId,
      address,
      defaultAccount.data.address, // TODO: get shielded account if shielded selected
      selectedAsset.base,
      "1", // TODO: how do I get the amount out of TransferModule?
      sourceChannelId
    );
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
          walletAddress: address,
          onChangeWallet,
        }}
        destination={{
          chain: namadaChain as Chain,
          availableWallets: [wallets.namada!],
          wallet: wallets.namada,
          isShielded: shielded,
          onChangeShielded: setShielded,
        }}
        onSubmitTransfer={onSubmitTransfer}
      />
    </Panel>
  );
};

const ibcAddressToDenom = async (
  address: string,
  rpc: string
): Promise<string> => {
  const tmClient = await Tendermint34Client.connect(rpc);
  const queryClient = new QueryClient(tmClient);
  const ibcExtension = setupIbcExtension(queryClient);

  const ibcHash = address.replace("ibc/", "");
  const { denomTrace } = await ibcExtension.ibc.transfer.denomTrace(ibcHash);
  const baseDenom = denomTrace?.baseDenom;

  if (typeof baseDenom === "undefined") {
    throw new Error("couldn't get denom from ibc address");
  }

  return baseDenom;
};

const submitIbcTransfer = async (
  rpc: string,
  sourceChainId: string,
  source: string,
  target: string,
  token: string,
  amount: string,
  channelId: string
): Promise<void> => {
  const client = await SigningStargateClient.connectWithSigner(
    rpc,
    keplr.getOfflineSigner(sourceChainId),
    {
      broadcastPollIntervalMs: 300,
      broadcastTimeoutMs: 8_000,
    }
  );

  const fee = {
    amount: coins("0", token),
    gas: "222000",
  };

  const response = await client.sendIbcTokens(
    source,
    target,
    coin(amount, token),
    "transfer",
    channelId,
    undefined, // timeout height
    Math.floor(Date.now() / 1000) + 60, // timeout timestamp
    fee,
    `${sourceChainId}->Namada`
  );

  if (response.code !== 0) {
    throw new Error(response.code + " " + response.rawLog);
  }
};
