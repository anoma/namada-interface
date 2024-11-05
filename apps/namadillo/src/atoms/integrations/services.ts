import { Asset, Chain } from "@chain-registry/types";
import { Coin, OfflineSigner } from "@cosmjs/launchpad";
import { coin, coins } from "@cosmjs/proto-signing";
import {
  MsgTransferEncodeObject,
  SigningStargateClient,
  StargateClient,
} from "@cosmjs/stargate";
import { TransactionFee } from "App/Transfer/TransferModule";
import BigNumber from "bignumber.js";
import { getDefaultStore } from "jotai";
import { toBaseAmount } from "utils";
import { getSdkInstance } from "utils/sdk";
import { workingRpcsAtom } from "./atoms";
import { getRpcByIndex } from "./functions";

type CommonParams = {
  signer: OfflineSigner;
  sourceAddress: string;
  destinationAddress: string;
  amount: BigNumber;
  asset: Asset;
  sourceChannelId: string;
  transactionFee: TransactionFee;
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

type QueryFn<T> = (rpc: string) => Promise<T>;

export const queryAssetBalances = async (
  owner: string,
  rpc: string
): Promise<Coin[]> => {
  const client = await StargateClient.connect(rpc);
  return ((await client.getAllBalances(owner)) as Coin[]) || [];
};

export const submitIbcTransfer =
  (transferParams: IbcTransferParams) =>
  async (rpc: string): Promise<void> => {
    const {
      signer,
      sourceAddress,
      destinationAddress,
      amount: displayAmount,
      asset,
      sourceChannelId,
      isShielded,
      transactionFee,
    } = transferParams;

    const client = await SigningStargateClient.connectWithSigner(rpc, signer, {
      broadcastPollIntervalMs: 300,
      broadcastTimeoutMs: 8_000,
    });

    // cosmjs expects amounts to be represented in the base denom, so convert
    const baseAmount = toBaseAmount(asset, displayAmount);
    const baseFee = toBaseAmount(transactionFee.token, transactionFee.amount);

    const fee = {
      amount: coins(baseFee.toString(), transactionFee.token.base),
      gas: "222000", // TODO: what should this be?
    };

    const timeoutTimestampNanoseconds =
      BigInt(Math.floor(Date.now() / 1000) + 60) * BigInt(1_000_000_000);

    const token = asset.base;

    const { receiver, memo }: { receiver: string; memo?: string } =
      isShielded ?
        await getShieldedArgs(
          destinationAddress,
          token,
          baseAmount,
          transferParams.destinationChannelId
        )
      : { receiver: destinationAddress };

    const transferMsg: MsgTransferEncodeObject = {
      typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
      value: {
        sourcePort: "transfer",
        sourceChannel: sourceChannelId,
        sender: sourceAddress,
        receiver,
        token: coin(baseAmount.toString(), token),
        timeoutHeight: undefined,
        timeoutTimestamp: timeoutTimestampNanoseconds,
        memo,
      },
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
