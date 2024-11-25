import { Asset } from "@chain-registry/types";
import { coin } from "@cosmjs/proto-signing";
import {
  Attribute,
  DeliverTxResponse,
  MsgTransferEncodeObject,
} from "@cosmjs/stargate";
import namada from "@namada/chains/chains/namada";
import {
  ShieldedTransferMsgValue,
  ShieldingTransferMsgValue,
  TransparentTransferMsgValue,
  UnshieldingTransferMsgValue,
} from "@namada/types";
import BigNumber from "bignumber.js";

import {
  allTransferStages,
  AllTransferTxKind,
  IbcTransferStage,
  IbcTransferTransactionData,
  NamadaTransferTxKind,
  TransferStep,
  TransferTransactionData,
} from "types";
import { toDisplayAmount } from "utils";
import { TransactionPair } from "./query";

export const getEventAttribute = (
  tx: DeliverTxResponse,
  attributeType: string
): Record<string, string> => {
  const attributes: readonly Attribute[] =
    tx.events.find((event) => event.type === attributeType)?.attributes || [];
  return attributes.reduce(
    (obj, current) => {
      return {
        ...obj,
        [current.key]: current.value,
      };
    },
    {} as Record<string, string>
  );
};

const getTxNextStep = (
  txKind: AllTransferTxKind,
  currentStep: TransferStep
): TransferStep => {
  const stages = allTransferStages[txKind];
  const stepIdx = stages.findIndex((el) => el === currentStep);
  return stages[Math.min(stepIdx + 1, stages.length - 1)];
};

const getAttributeValue = (
  attributeMap: Record<string, string>,
  key: string
): string => {
  if (key in attributeMap) {
    return attributeMap[key];
  }
  return "";
};

const getNumberAttributeValue = (
  attributeMap: Record<string, string>,
  key: string
): BigNumber => {
  const value = getAttributeValue(attributeMap, key);
  return new BigNumber(value || 0);
};

const getAmountAttributeValue = (
  attributeMap: Record<string, string>,
  key: string,
  denom: string
): BigNumber => {
  const value = getAttributeValue(attributeMap, key);
  return new BigNumber(value.replace(denom, "") || 0);
};

export const createIbcTransferMessage = (
  sourceChannelId: string,
  sourceAddress: string,
  receiverAddress: string,
  amount: BigNumber,
  token: string,
  memo: string = ""
): MsgTransferEncodeObject => {
  const timeoutTimestampNanoseconds =
    BigInt(Math.floor(Date.now() / 1000) + 60) * BigInt(1_000_000_000);
  return {
    typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
    value: {
      sourcePort: "transfer",
      sourceChannel: sourceChannelId,
      sender: sourceAddress,
      receiver: receiverAddress,
      token: coin(amount.toString(), token),
      timeoutHeight: undefined,
      timeoutTimestamp: timeoutTimestampNanoseconds,
      memo,
    },
  };
};

export const createTransferDataFromIbc = (
  tx: DeliverTxResponse,
  rpc: string,
  asset: Asset,
  sourceChainId: string,
  details: IbcTransferStage
): TransferTransactionData => {
  const transferAttributes = getEventAttribute(tx, "ibc_transfer");
  const packetAttributes = getEventAttribute(tx, "send_packet");
  const feeAttributes = getEventAttribute(tx, "fee_pay");
  const tipAttributes = getEventAttribute(tx, "tip_pay");
  const baseDenom = asset.base;

  const transferAmount = toDisplayAmount(
    asset,
    getAmountAttributeValue(transferAttributes, "amount", baseDenom)
  );

  const tipPaid = toDisplayAmount(
    asset,
    getAmountAttributeValue(tipAttributes, "tip", baseDenom)
  );

  const feePaid = toDisplayAmount(
    asset,
    getAmountAttributeValue(feeAttributes, "fee", baseDenom)
  );

  const transferTx: IbcTransferTransactionData = {
    ...details,
    hash: tx.transactionHash,
    rpc,
    asset,
    feePaid,
    tipPaid,
    amount: transferAmount,
    status: "pending",
    sourcePort: "transfer",
    chainId: sourceChainId,
    destinationChainId: namada.chainId, //TODO: integrate with registry,
    sourceAddress: getAttributeValue(transferAttributes, "sender"),
    destinationAddress: getAttributeValue(transferAttributes, "receiver"),
    sequence: getNumberAttributeValue(packetAttributes, "packet_sequence"),
    sourceChannel: getAttributeValue(packetAttributes, "packet_src_channel"),
    destinationChannel: getAttributeValue(
      packetAttributes,
      "packet_dst_channel"
    ),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  return transferTx;
};

export const createTransferDataFromNamada = (
  txKind: NamadaTransferTxKind,
  asset: Asset,
  rpcUrl: string,
  txResponse?:
    | TransactionPair<TransparentTransferMsgValue>
    | TransactionPair<ShieldedTransferMsgValue>
    | TransactionPair<ShieldingTransferMsgValue>
    | TransactionPair<UnshieldingTransferMsgValue>,
  memo = ""
): TransferTransactionData[] => {
  if (!txResponse?.encodedTxData?.txs?.length) {
    throw "Invalid transaction response";
  }

  const propsList = txResponse.encodedTxData.meta?.props;
  if (!propsList || propsList.length === 0) {
    throw "Invalid transaction props";
  }

  return propsList
    .map(({ data }) => {
      return data.map((props) => {
        const sourceAddress = "source" in props ? (props.source as string) : "";
        const destinationAddress =
          "target" in props ? (props.target as string) : "";
        const amount = "amount" in props ? props.amount : new BigNumber(0);
        return {
          type: txKind,
          currentStep: getTxNextStep(txKind, TransferStep.Sign),
          sourceAddress,
          destinationAddress,
          asset,
          amount,
          memo,
          rpc: rpcUrl,
          chainId: txResponse?.encodedTxData.txs[0]?.args.chainId ?? "",
          hash: txResponse?.encodedTxData.txs[0].hash,
          feePaid: txResponse?.encodedTxData.txs[0].args.feeAmount,
          resultTxHash: txResponse?.encodedTxData.txs[0].hash,
          status: "pending",
          createdAt: new Date(),
          updatedAt: new Date(),
        } as TransferTransactionData;
      });
    })
    .flat();
};
