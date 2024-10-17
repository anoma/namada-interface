import { Asset, Chain } from "@chain-registry/types";
import { Coin, OfflineSigner } from "@cosmjs/launchpad";
import { coin, coins } from "@cosmjs/proto-signing";
import {
  MsgTransferEncodeObject,
  QueryClient,
  SigningStargateClient,
  StargateClient,
  setupIbcExtension,
} from "@cosmjs/stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import BigNumber from "bignumber.js";
import { MsgTransfer } from "cosmjs-types/ibc/applications/transfer/v1/tx";
import { getDefaultStore } from "jotai";
import { getSdkInstance } from "utils/sdk";
import { workingRpcsAtom } from "./atoms";
import { getRpcByIndex } from "./functions";

type CommonParams = {
  signer: OfflineSigner;
  sourceAddress: string;
  destinationAddress: string;
  amount: BigNumber;
  token: string;
  sourceChannelId: string;
};

type TransparentParams = CommonParams & { isShielded: false };
type ShieldedParams = CommonParams & {
  isShielded: true;
  destinationChannelId: string;
};

export type IbcTransferParams = TransparentParams | ShieldedParams;

const getShieldedArgs = async (
  target: string,
  token: string,
  amount: BigNumber,
  destinationChannelId: string
): Promise<{ receiver: string; memo: string }> => {
  const sdk = await getSdkInstance();

  const memo = await sdk.tx.generateIbcShieldingMemo(
    target,
    token,
    amount,
    destinationChannelId
  );

  return {
    receiver: sdk.masp.maspAddress(),
    memo,
  };
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
  return await Promise.all(
    balances.map(async (coin: Coin) => {
      if (coin.denom.startsWith("ibc/")) {
        return { ...coin, denom: await ibcAddressToDenom(rpc, coin.denom) };
      }
      return coin;
    })
  );
};

const ibcAddressToDenom = async (
  rpc: string,
  address: string
): Promise<string> => {
  const tmClient = await Tendermint34Client.connect(rpc);
  const queryClient = new QueryClient(tmClient);
  const ibcExtension = setupIbcExtension(queryClient);
  const ibcHash = address.replace("ibc/", "");

  const { denomTrace } = await ibcExtension.ibc.transfer.denomTrace(ibcHash);
  const baseDenom = denomTrace?.baseDenom;

  if (typeof baseDenom === "undefined") {
    throw new Error("Couldn't get denom from ibc address");
  }

  return baseDenom;
};

export const submitIbcTransfer =
  (transferParams: IbcTransferParams) =>
  async (rpc: string): Promise<void> => {
    const {
      signer,
      sourceAddress,
      destinationAddress,
      amount,
      token,
      sourceChannelId,
      isShielded,
    } = transferParams;

    const client = await SigningStargateClient.connectWithSigner(rpc, signer, {
      broadcastPollIntervalMs: 300,
      broadcastTimeoutMs: 8_000,
    });

    const fee = {
      amount: coins("0", token),
      gas: "222000",
    };

    const timeoutTimestampNanoseconds =
      BigInt(Math.floor(Date.now() / 1000) + 60) * BigInt(1_000_000_000);

    const { receiver, memo }: { receiver: string; memo?: string } =
      isShielded ?
        await getShieldedArgs(
          destinationAddress,
          token,
          amount,
          transferParams.destinationChannelId
        )
      : { receiver: destinationAddress };

    const transferMsg: MsgTransferEncodeObject = {
      typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
      value: MsgTransfer.fromPartial({
        sourcePort: "transfer",
        sourceChannel: sourceChannelId,
        sender: sourceAddress,
        receiver,
        token: coin(amount.toString(), token),
        timeoutHeight: undefined,
        timeoutTimestamp: timeoutTimestampNanoseconds,
        memo,
      }),
    };

    const response = await client.signAndBroadcast(
      sourceAddress,
      [transferMsg],
      fee
    );

    if (response.code !== 0) {
      throw new Error(response.code + " " + response.transactionHash);
    }
  };

export const queryAndStoreRpc = async <T>(
  chain: Chain,
  queryFn: QueryFn<T>,
  rpcIndex = 0
): Promise<T> => {
  const { get, set } = getDefaultStore();
  const workingRpcs = get(workingRpcsAtom);
  const rpcAddress =
    chain.chain_id in workingRpcs ?
      workingRpcs[chain.chain_id]
    : getRpcByIndex(chain, rpcIndex);

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
