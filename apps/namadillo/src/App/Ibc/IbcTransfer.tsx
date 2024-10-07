import { Coin } from "@cosmjs/launchpad";
import { coin, coins } from "@cosmjs/proto-signing";
import {
  QueryClient,
  SigningStargateClient,
  StargateClient,
  setupIbcExtension,
} from "@cosmjs/stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { Window as KeplrWindow } from "@keplr-wallet/types";
import { Panel } from "@namada/components";
import { mapUndefined } from "@namada/utils";
import { TransferModule } from "App/Transfer/TransferModule";
import BigNumber from "bignumber.js";
import { wallets } from "integrations";
import { useEffect, useState } from "react";
import { WalletProvider } from "types";

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

import { useAtomValue } from "jotai";
import namadaChain from "registry/namada.json";

import { Asset, Chain } from "@chain-registry/types";
import { settingsAtom } from "atoms/settings";

const keplr = (window as KeplrWindow).keplr!;

const mainnetChains = {
  [celestia.chain.chain_id]: celestia,
  [cosmos.chain.chain_id]: cosmos,
  [dydx.chain.chain_id]: dydx,
  [osmosis.chain.chain_id]: osmosis,
  [stargaze.chain.chain_id]: stargaze,
};

const testnetChains = {
  [cosmosTestnet.chain.chain_id]: cosmosTestnet,
  [celestiaTestnet.chain.chain_id]: celestiaTestnet,
  [dydxTestnet.chain.chain_id]: dydxTestnet,
  [osmosisTestnet.chain.chain_id]: osmosisTestnet,
  [stargazeTestnet.chain.chain_id]: stargazeTestnet,
};

type AssetWithBalance = {
  asset: Asset;
  balance?: BigNumber;
};

export const IbcTransfer: React.FC = () => {
  const settings = useAtomValue(settingsAtom);
  const [address, setAddress] = useState<string | undefined>();
  const [chainId, setChainId] = useState<string | undefined>();
  const [shielded, setShielded] = useState<boolean>(true);
  const [availableChains, setAvailableChains] = useState<Chain[]>([]);
  const [assetsWithBalances, setAssetsWithBalances] = useState<
    AssetWithBalance[]
  >([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset>();
  const [sourceChannelId, setSourceChannelId] = useState<string>("");

  const defaultAccount = useAtomValue(defaultAccountAtom);

  const knownChains =
    settings.enableTestnets ?
      { ...mainnetChains, ...testnetChains }
    : mainnetChains;

  const onChangeWallet = async (wallet: WalletProvider): Promise<void> => {
    if (wallet.id === "keplr") {
      const keplrChainIds: string[] =
        // TODO: bump the keplr package so i don't have to cast
        (
          (await // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (keplr as any).getChainInfosWithoutEndpoints()) as {
            chainId: string;
          }[]
        ).map((chain) => chain.chainId);

      const knownChainsWithKeplrInfo = Object.entries(knownChains)
        .filter(([chainId]) => keplrChainIds.includes(chainId))
        .map(([_, { chain }]) => chain);

      await keplr.enable(
        knownChainsWithKeplrInfo.map((chain) => chain.chain_id)
      );

      const firstChain = knownChainsWithKeplrInfo[0];

      setAvailableChains(knownChainsWithKeplrInfo);
      setChainId(firstChain.chain_id);
    }
  };

  const updateAddress = async (): Promise<void> => {
    if (typeof chainId !== "undefined") {
      const keplrKey = await keplr.getKey(chainId);
      setAddress(keplrKey.bech32Address);
    }
  };

  const updateAssets = async (): Promise<void> => {
    if (typeof chainId !== "undefined" && typeof address !== "undefined") {
      const { chain, assets: assetInfo } = knownChains[chainId];

      const rpc = chain.apis?.rpc?.[0]?.address;

      if (typeof rpc === "undefined") {
        throw new Error("no RPC info for " + chainId);
      }

      const balances = await queryBalances(address, rpc);

      const assets: AssetWithBalance[] = balances.flatMap(
        ({ denom, amount }) => {
          const maybeBigNumberAmount = BigNumber(amount);
          const bigNumberAmount =
            maybeBigNumberAmount.isNaN() ? undefined : maybeBigNumberAmount;

          const maybeAsset = assetInfo.assets.find(
            (asset) => asset.base === denom
          );

          if (typeof maybeAsset !== "undefined") {
            return [
              {
                asset: maybeAsset,
                balance: bigNumberAmount,
              },
            ];
          } else {
            // TODO: we might want to show assets that we don't have configs for anyway
            return [];
          }
        }
      );

      setAssetsWithBalances(assets);
      setSelectedAsset(assets[0]?.asset);
    }
  };

  useEffect(() => {
    updateAddress();
  }, [chainId]);

  useEffect(() => {
    updateAssets();
  }, [address]);

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
          selectedAsset,
          availableAssets: assetsWithBalances.map(({ asset }) => asset),
          availableAmount: assetsWithBalances.find(
            ({ asset }) => asset === selectedAsset
          )?.balance,
          onChangeSelectedAsset: setSelectedAsset,
          availableChains,
          wallet: wallets.keplr,
          onChangeChain: (chain) => setChainId(chain.chain_id),
          onChangeWallet,
          chain: mapUndefined((id) => knownChains[id].chain, chainId),
          walletAddress: address,
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

const queryBalances = async (owner: string, rpc: string): Promise<Coin[]> => {
  const client = await StargateClient.connect(rpc);
  const balances = (await client.getAllBalances(owner)) || [];

  await Promise.all(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    balances.map(async (coin: any) => {
      // any becuse of annoying readonly
      if (coin.denom.startsWith("ibc/")) {
        coin.denom = await ibcAddressToDenom(coin.denom, rpc);
      }
    })
  );

  return [...balances];
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
