import { Chain } from "@chain-registry/types";
import { Coin, OfflineSigner } from "@cosmjs/launchpad";
import { coins } from "@cosmjs/proto-signing";
import {
  DeliverTxResponse,
  SigningStargateClient,
  StargateClient,
} from "@cosmjs/stargate";
import { TransactionFee } from "App/Transfer/TransferModule";
import { queryForAck, queryForIbcTimeout } from "atoms/transactions";
import BigNumber from "bignumber.js";
import { getDefaultStore } from "jotai";
import { createIbcTransferMessage } from "lib/transactions";
import {
  AddressWithAsset,
  IbcTransferTransactionData,
  TransferStep,
} from "types";
import { toBaseAmount } from "utils";
import { getSdkInstance } from "utils/sdk";
import { workingRpcsAtom } from "./atoms";
import { getRpcByIndex } from "./functions";

type CommonParams = {
  signer: OfflineSigner;
  chainId: string;
  sourceAddress: string;
  destinationAddress: string;
  amount: BigNumber;
  asset: AddressWithAsset;
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

export const submitIbcTransfer = async (
  rpc: string,
  transferParams: IbcTransferParams
): Promise<DeliverTxResponse> => {
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
  const baseAmount = toBaseAmount(asset.asset, displayAmount);
  const baseFee = toBaseAmount(transactionFee.asset, transactionFee.amount);

  const fee = {
    amount: coins(baseFee.toString(), transactionFee.originalAddress),
    gas: "222000", // TODO: what should this be?
  };

  const token = asset.originalAddress;
  const { receiver, memo }: { receiver: string; memo?: string } =
    isShielded ?
      await getShieldedArgs(
        destinationAddress,
        token,
        baseAmount,
        transferParams.destinationChannelId
      )
    : { receiver: destinationAddress };

  const transferMsg = createIbcTransferMessage(
    sourceChannelId,
    sourceAddress,
    receiver,
    baseAmount,
    asset.asset.base,
    memo
  );

  const response = await client.signAndBroadcast(
    sourceAddress,
    [transferMsg],
    fee
  );

  if (response.code !== 0) {
    throw new Error(response.code + " " + response.transactionHash);
  }

  return response;
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

export const updateIbcTransactionStatus = async (
  rpc: string,
  tx: IbcTransferTransactionData,
  changeTransaction: (
    hash: string,
    update: Partial<IbcTransferTransactionData>
  ) => void
): Promise<void> => {
  const client = await StargateClient.connect(rpc);
  const successQueries = await queryForAck(client, tx);
  if (successQueries.length > 0 && tx.hash) {
    changeTransaction(tx.hash, {
      status: "success",
      currentStep: TransferStep.Complete,
      resultTxHash: successQueries[0].hash,
    });
    return;
  }

  const timeoutQuery = await queryForIbcTimeout(client, tx);
  if (timeoutQuery.length > 0 && tx.hash) {
    changeTransaction(tx.hash, {
      status: "error",
      errorMessage: "Transaction timed out",
      resultTxHash: timeoutQuery[0].hash,
    });
  }
};
