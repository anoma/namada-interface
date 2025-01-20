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
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";

import { sanitizeUrl } from "@namada/utils";
import { getIndexerApi } from "atoms/api";
import { queryForAck, queryForIbcTimeout } from "atoms/transactions";
import BigNumber from "bignumber.js";
import { getDefaultStore } from "jotai";
import toml from "toml";
import {
  AddressWithAsset,
  Coin,
  GasConfig,
  IbcTransferTransactionData,
  LocalnetToml,
  TransferStep,
} from "types";
import { getKeplrWallet } from "utils/ibc";
import { getSdkInstance } from "utils/sdk";
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
    changeTransaction(tx.hash, {
      status: "success",
      currentStep: TransferStep.Complete,
      resultTxHash: successQueries[0].hash,
    });

    window.dispatchEvent(
      new CustomEvent(`IbcTransfer.Success`, {
        detail: {
          ...(tx as IbcTransferTransactionData),
        },
      })
    );

    return;
  }

  const timeoutQuery = await queryForIbcTimeout(client, tx);
  if (timeoutQuery.length > 0 && tx.hash) {
    changeTransaction(tx.hash, {
      status: "error",
      errorMessage: "Transaction timed out",
      resultTxHash: timeoutQuery[0].hash,
    });

    window.dispatchEvent(
      new CustomEvent(`IbcTransfer.Error`, {
        detail: { ...(tx as IbcTransferTransactionData) },
      })
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
  const api = getIndexerApi();
  if (!tx.hash) throw "Transaction hash not defined";
  const response = await api.apiV1IbcTxIdStatusGet(tx.hash);

  const { status } = response.data;

  if (status === "success") {
    changeTransaction(tx.hash, {
      status: "success",
      currentStep: TransferStep.Complete,
    });
    window.dispatchEvent(
      new CustomEvent(`IbcTransfer.Success`, {
        detail: { ...(tx as IbcTransferTransactionData) },
      })
    );
    return;
  }

  if (status === "fail" || status === "timeout") {
    changeTransaction(tx.hash, {
      status: "error",
      errorMessage: "IBC Withdraw failed",
    });
    window.dispatchEvent(
      new CustomEvent(`IbcTransfer.Error`, {
        detail: { ...(tx as IbcTransferTransactionData) },
      })
    );
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
