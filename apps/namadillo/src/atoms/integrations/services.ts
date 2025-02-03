import { Chain, IBCInfo } from "@chain-registry/types";
import { OfflineSigner } from "@cosmjs/launchpad";
import {
  assertIsDeliverTxSuccess,
  calculateFee,
  DeliverTxResponse,
  MsgTransferEncodeObject,
  SigningStargateClient,
  StargateClient,
  StdFee,
} from "@cosmjs/stargate";
import { sanitizeUrl } from "@namada/utils";
import { getIndexerApi } from "atoms/api";
import { chainParametersAtom } from "atoms/chain";
import { rpcUrlAtom } from "atoms/settings";
import { queryForAck, queryForIbcTimeout } from "atoms/transactions";
import BigNumber from "bignumber.js";
import * as Comlink from "comlink";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { differenceInMinutes } from "date-fns";
import { getDefaultStore } from "jotai";
import toml from "toml";
import {
  AddressWithAsset,
  Coin,
  GasConfig,
  IbcTransferTransactionData,
  LocalnetToml,
  TransferStep,
  TransferTransactionData,
} from "types";
import { getKeplrWallet } from "utils/ibc";
import { getSdkInstance } from "utils/sdk";
import { GenerateIbcShieldingMemo } from "workers/MaspTxMessages";
import { Worker as MaspTxWorkerApi } from "workers/MaspTxWorker";
import MaspTxWorker from "workers/MaspTxWorker?worker";
import { rpcByChainAtom } from "./atoms";
import {
  getChainRegistryIbcFilePath,
  getChannelFromIbcInfo,
  getRpcByIndex,
  IbcChannels,
} from "./functions";

type CommonParams = {
  signer: OfflineSigner;
  chainId: string;
  sourceAddress: string;
  destinationAddress: string;
  amount: BigNumber;
  asset: AddressWithAsset;
  sourceChannelId: string;
  gasConfig: GasConfig;
};

type TransparentParams = CommonParams & { isShielded: false };
type ShieldedParams = CommonParams & {
  isShielded: true;
  destinationChannelId: string;
};

export type IbcTransferParams = TransparentParams | ShieldedParams;

export const getShieldedArgs = async (
  target: string,
  token: string,
  amount: BigNumber,
  destinationChannelId: string
): Promise<{ receiver: string; memo: string }> => {
  const sdk = await getSdkInstance();
  const store = getDefaultStore();
  const rpcUrl = store.get(rpcUrlAtom);
  const chain = store.get(chainParametersAtom);

  if (!chain.isSuccess) throw "Chain not loaded";

  const worker = new MaspTxWorker();
  const workerLink = Comlink.wrap<MaspTxWorkerApi>(worker);
  await workerLink.init({
    type: "init",
    payload: { rpcUrl, token: sdk.nativeToken, maspIndexerUrl: "" },
  });

  const msg: GenerateIbcShieldingMemo = {
    type: "generate-ibc-shielding-memo",
    payload: {
      target,
      token,
      amount,
      destinationChannelId,
      chainId: chain.data.chainId,
    },
  };

  const memo = (await workerLink.generateIbcShieldingMemo(msg)).payload;

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
  const balances = (await client.getAllBalances(owner)) || [];

  return balances.map((balance) => ({
    denom: balance.denom,
    minDenomAmount: balance.amount,
  }));
};

export const createStargateClient = async (
  rpc: string,
  chain: Chain
): Promise<SigningStargateClient> => {
  const keplr = getKeplrWallet();
  const signer = keplr.getOfflineSigner(chain.chain_id);
  return await SigningStargateClient.connectWithSigner(rpc, signer, {
    broadcastPollIntervalMs: 300,
    broadcastTimeoutMs: 8_000,
  });
};

export const getSignedMessage = async (
  client: SigningStargateClient,
  transferMsg: MsgTransferEncodeObject,
  gasConfig: GasConfig
): Promise<TxRaw> => {
  const fee: StdFee = calculateFee(
    Math.ceil(gasConfig.gasLimit.toNumber()),
    `${gasConfig.gasPrice.toString()}${gasConfig.gasToken}`
  );
  return await client.sign(transferMsg.value.sender!, [transferMsg], fee, "");
};

export const broadcastIbcTransaction = async (
  client: SigningStargateClient,
  tx: TxRaw
): Promise<DeliverTxResponse> => {
  const txBytes = TxRaw.encode(tx).finish();
  const response = await client.broadcastTx(txBytes);
  assertIsDeliverTxSuccess(response);
  return response;
};

export const queryAndStoreRpc = async <T>(
  chain: Chain,
  queryFn: QueryFn<T>
): Promise<T> => {
  const { get, set } = getDefaultStore();
  const lastRpc = get(rpcByChainAtom) || {};
  const rpc =
    chain.chain_id in lastRpc ?
      lastRpc[chain.chain_id]
    : getRpcByIndex(chain, 0);

  try {
    const output = await queryFn(rpc.address);
    set(rpcByChainAtom, {
      ...lastRpc,
      [chain.chain_id]: { ...rpc },
    });
    return output;
  } catch (err) {
    // On error, saves the next available rpc
    set(rpcByChainAtom, {
      ...lastRpc,
      [chain.chain_id]: getRpcByIndex(chain, rpc.index + 1),
    });
    throw err;
  }
};

const isTransferLocalTimeout = (
  tx: TransferTransactionData,
  timeoutInMinutes = 10
): boolean => {
  return differenceInMinutes(Date.now(), tx.createdAt) > timeoutInMinutes;
};

const dispatchTransactionEvent = (
  eventName: string,
  tx: IbcTransferTransactionData
): void => {
  window.dispatchEvent(
    new CustomEvent(eventName, {
      detail: { ...tx },
    })
  );
};

const handleTransactionSuccess = (
  hash: string,
  changeTransaction: (
    hash: string,
    update: Partial<IbcTransferTransactionData>
  ) => void,
  tx: IbcTransferTransactionData,
  resultTxHash?: string
): void => {
  const update: Partial<IbcTransferTransactionData> = {
    status: "success",
    currentStep: TransferStep.Complete,
    ...(resultTxHash && { resultTxHash }),
  };
  changeTransaction(hash, update);
  dispatchTransactionEvent("IbcTransfer.Success", tx);
};

const handleTransactionError = (
  hash: string,
  changeTransaction: (
    hash: string,
    update: Partial<IbcTransferTransactionData>
  ) => void,
  tx: IbcTransferTransactionData,
  errorMessage: string,
  resultTxHash?: string
): void => {
  const update: Partial<IbcTransferTransactionData> = {
    status: "error",
    errorMessage,
    ...(resultTxHash && { resultTxHash }),
  };
  changeTransaction(hash, update);
  dispatchTransactionEvent("IbcTransfer.Error", tx);
};

const checkForIbcTransferTimeout = async (
  client: StargateClient,
  tx: IbcTransferTransactionData
): Promise<{ isTimeout: boolean; timeoutHash: string }> => {
  let isTimeout = isTransferLocalTimeout(tx);
  let timeoutHash = "";

  if (!isTimeout) {
    const timeoutQuery = await queryForIbcTimeout(client, tx);
    isTimeout = timeoutQuery.length > 0;
    timeoutHash = timeoutQuery[0]?.hash || "";
  }

  return {
    isTimeout,
    timeoutHash,
  };
};

export const updateIbcTransferStatus = async (
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
    handleTransactionSuccess(
      tx.hash,
      changeTransaction,
      tx,
      successQueries[0].hash
    );
    return;
  }

  const { isTimeout, timeoutHash } = await checkForIbcTransferTimeout(
    client,
    tx
  );
  if (isTimeout && tx.hash) {
    handleTransactionError(
      tx.hash,
      changeTransaction,
      tx,
      "Transaction timed out",
      timeoutHash
    );
  }
};

export const updateIbcWithdrawalStatus = async (
  tx: IbcTransferTransactionData,
  changeTransaction: (
    hash: string,
    update: Partial<IbcTransferTransactionData>
  ) => void
): Promise<void> => {
  if (!tx.hash) throw new Error("Transaction hash not defined");

  const api = getIndexerApi();
  const response = await api.apiV1IbcTxIdStatusGet(tx.hash);
  const { status } = response.data;

  if (status === "success") {
    handleTransactionSuccess(tx.hash, changeTransaction, tx);
    return;
  }

  const isTimeout = status === "timeout" || isTransferLocalTimeout(tx);
  if (status === "fail" || isTimeout) {
    const errorMessage =
      isTimeout ? "Transaction timed out" : "IBC Withdraw failed";

    handleTransactionError(tx.hash, changeTransaction, tx, errorMessage);
  }
};

export const fetchLocalnetTomlConfig = async (): Promise<LocalnetToml> => {
  const response = await fetch("/localnet-config.toml");
  return toml.parse(await response.text()) as LocalnetToml;
};

export const fetchIbcChannelFromRegistry = async (
  currentNamadaChainId: string,
  ibcChainName: string,
  namadaChainRegistryUrl: string
): Promise<IbcChannels | null> => {
  const ibcFilePath = getChainRegistryIbcFilePath(
    currentNamadaChainId,
    ibcChainName
  );

  const queryUrl = new URL(
    ibcFilePath,
    sanitizeUrl(namadaChainRegistryUrl) + "/"
  );

  const channelInfo: IBCInfo = await (await fetch(queryUrl.toString())).json();
  return getChannelFromIbcInfo(ibcChainName, channelInfo) || null;
};

export const simulateIbcTransferFee = async (
  stargateClient: SigningStargateClient,
  sourceAddress: string,
  transferMsg: MsgTransferEncodeObject,
  additionalPercentage: number = 0.05
): Promise<number> => {
  const estimatedGas = await stargateClient.simulate(
    sourceAddress!,
    [transferMsg],
    undefined
  );
  return estimatedGas * (1 + additionalPercentage);
};
