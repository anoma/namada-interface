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
import {
  WrapperTransaction,
  WrapperTransactionExitCodeEnum,
} from "@namada/indexer-client";
import { sanitizeUrl } from "@namada/utils";
import { getIndexerApi } from "atoms/api";
import { chainParametersAtom } from "atoms/chain";
import { rpcUrlAtom } from "atoms/settings";
import { queryForAck, queryForIbcTimeout } from "atoms/transactions";
import BigNumber from "bignumber.js";
import * as Comlink from "comlink";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { differenceInHours, differenceInMinutes } from "date-fns";
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
import { isError404 } from "utils/http";
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
    `${gasConfig.gasPriceInMinDenom.toString()}${gasConfig.gasToken}`
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

const updateTxWithSuccess = <
  T extends TransferTransactionData | IbcTransferTransactionData,
>(
  tx: T,
  resultTxHash?: string
): T => {
  return {
    ...tx,
    status: "success",
    currentStep: TransferStep.Complete,
    ...(resultTxHash && { resultTxHash }),
  };
};

const updateTxWithError = <
  T extends TransferTransactionData | IbcTransferTransactionData,
>(
  tx: T,
  errorMessage: string,
  resultTxHash?: string
): T => {
  return {
    ...tx,
    status: "error",
    errorMessage,
    ...(resultTxHash && { resultTxHash }),
  };
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
  tx: IbcTransferTransactionData
): Promise<IbcTransferTransactionData> => {
  const client = await StargateClient.connect(tx.rpc);
  const successQueries = await queryForAck(client, tx);

  if (successQueries.length > 0 && tx.hash) {
    return updateTxWithSuccess(tx, successQueries[0].hash);
  }

  const { isTimeout, timeoutHash } = await checkForIbcTransferTimeout(
    client,
    tx
  );

  if (isTimeout && tx.hash) {
    return updateTxWithError(tx, "Transaction timed out", timeoutHash);
  }

  return { ...tx };
};

export const updateIbcWithdrawalStatus = async (
  tx: IbcTransferTransactionData
): Promise<IbcTransferTransactionData> => {
  if (!tx.hash) throw new Error("Transaction hash not defined");

  const api = getIndexerApi();
  const response = await api.apiV1IbcTxIdStatusGet(tx.hash);
  const { status } = response.data;

  if (status === "success") {
    return updateTxWithSuccess(tx);
  }

  const isTimeout = status === "timeout" || isTransferLocalTimeout(tx);
  if (status === "fail" || isTimeout) {
    const errorMessage =
      isTimeout ? "Transaction timed out" : "IBC Withdraw failed";

    return updateTxWithError(tx, errorMessage);
  }

  return { ...tx };
};

export const handleStandardTransfer = (
  tx: TransferTransactionData,
  txResponse: WrapperTransaction
): TransferTransactionData => {
  // After 2h the pending status will be changed to timeout
  const pendingTimeoutInHours = 2;

  try {
    const hasRejectedTx = txResponse.innerTransactions.some(
      ({ exitCode }) => exitCode === WrapperTransactionExitCodeEnum.Rejected
    );

    if (hasRejectedTx) {
      return updateTxWithError(tx, "Transaction rejected");
    }

    return updateTxWithSuccess(tx);
  } catch (error) {
    if (
      isError404(error) &&
      differenceInHours(Date.now(), tx.createdAt) > pendingTimeoutInHours
    ) {
      return updateTxWithError(tx, "Transaction timed out");
    }
  }

  return { ...tx };
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

export const simulateIbcTransferGas = async (
  stargateClient: SigningStargateClient,
  sourceAddress: string,
  transferMsg: MsgTransferEncodeObject,
  additionalPercentage: number = 0.05
): Promise<number> => {
  try {
    const estimatedGas = await stargateClient.simulate(
      sourceAddress!,
      [transferMsg],
      undefined
    );
    return estimatedGas * (1 + additionalPercentage);
  } catch (error) {
    throw error;
  }
};

export const dispatchTransferEvent = (
  eventType: string,
  tx: TransferTransactionData
): void => {
  if (tx.status === "success") {
    window.dispatchEvent(
      new CustomEvent(`${eventType}.Success`, {
        detail: { ...tx },
      })
    );
  }

  if (tx.status === "error") {
    window.dispatchEvent(
      new CustomEvent(`${eventType}.Error`, {
        detail: { ...tx },
      })
    );
  }
};

// Check events name in types/events.ts
export const transactionTypeToEventName = (
  tx: TransferTransactionData
): string => {
  switch (tx.type) {
    case "ShieldedToTransparent":
      return "UnshieldingTransfer";

    case "TransparentToShielded":
      return "ShieldingTransfer";

    case "ShieldedToShielded":
      return "ShieldedTransfer";

    case "TransparentToTransparent":
      return "TransparentTransfer";

    case "TransparentToIbc":
      return "IbcWithdraw";

    case "IbcToShielded":
    case "IbcToTransparent":
      return "IbcTransfer";
  }
};
