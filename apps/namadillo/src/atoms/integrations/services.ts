import { Asset, Chain } from "@chain-registry/types";
import { Coin, OfflineSigner } from "@cosmjs/launchpad";
import { coin, coins } from "@cosmjs/proto-signing";
import { SigningStargateClient, StargateClient } from "@cosmjs/stargate";
import BigNumber from "bignumber.js";
import { getDefaultStore } from "jotai";
import { workingRpcsAtom } from "./atoms";
import { getRandomRpcAddress } from "./functions";

export type IBCTransferParams = {
  signer: OfflineSigner;
  sourceAddress: string;
  destinationAddress: string;
  amount: BigNumber;
  token: string;
  channelId: string;
  memo?: string;
};

export type AssetWithBalance = {
  asset: Asset;
  balance?: BigNumber;
};

type QueryFn<T> = (rpc: string) => Promise<T>;

export const queryAssetBalances = async (
  owner: string,
  rpc: string
): Promise<Coin[]> => {
  const client = await StargateClient.connect(rpc);
  const balances = (await client.getAllBalances(owner)) || [];
  return balances as Coin[];
};

export const submitIbcTransfer =
  (transferParams: IBCTransferParams) =>
  async (rpc: string): Promise<void> => {
    const {
      signer,
      sourceAddress,
      destinationAddress,
      amount,
      token,
      channelId,
      memo,
    } = transferParams;

    const client = await SigningStargateClient.connectWithSigner(rpc, signer, {
      broadcastPollIntervalMs: 300,
      broadcastTimeoutMs: 8_000,
    });

    const fee = {
      amount: coins("0", token),
      gas: "222000",
    };

    const response = await client.sendIbcTokens(
      sourceAddress,
      destinationAddress,
      coin(amount.toString(), token),
      "transfer",
      channelId,
      undefined, // timeout height
      Math.floor(Date.now() / 1000) + 60, // timeout timestamp
      fee,
      memo
    );

    if (response.code !== 0) {
      throw new Error(response.code + " " + response.rawLog);
    }
  };

export const queryAndStoreRpc = async <T>(
  chain: Chain,
  queryFn: QueryFn<T>
): Promise<T> => {
  const { get, set } = getDefaultStore();
  const workingRpcs = get(workingRpcsAtom);
  const rpcAddress =
    chain.chain_id in workingRpcs ?
      workingRpcs[chain.chain_id]
    : getRandomRpcAddress(chain);

  try {
    const output = await queryFn(rpcAddress);
    set(workingRpcsAtom, {
      ...workingRpcs,
      [chain.chain_id]: rpcAddress,
    });
    return output;
  } catch (err) {
    if (chain.chain_id in workingRpcs) {
      delete workingRpcs[chain.chain_id];
      set(workingRpcsAtom, { ...workingRpcs });
    }
    throw err;
  }
};
