import { Asset } from "@chain-registry/types";
import { coin } from "@cosmjs/proto-signing";
import {
  Attribute,
  DeliverTxResponse,
  MsgTransferEncodeObject,
} from "@cosmjs/stargate";
import namada from "@namada/chains/chains/namada";
import BigNumber from "bignumber.js";

import {
  IbcTransferStage,
  IbcTransferTransactionData,
  TransferTransactionData,
} from "types";
import { toDisplayAmount } from "utils";

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
