import BN from "bn.js";
import { Schema } from "borsh";
import { IbcTransferProps } from "../types";
import { TxMsgSchema, TxMsgValue } from "./tx";

export class IbcTransferMsgValue {
  tx: TxMsgValue;
  source: string;
  receiver: string;
  token: string;
  sub_prefix?: string;
  amount: BN;
  port_id: string;
  channel_id: string;
  timeout_height?: BN;
  timeout_sec_offset?: BN;

  constructor(properties: IbcTransferProps) {
    const timeoutHeight = properties.timeoutHeight
      ? new BN(properties.timeoutHeight, 64)
      : undefined;
    const timeoutSecOffset = properties.timeoutSecOffset
      ? new BN(properties.timeoutSecOffset, 64)
      : undefined;

    this.tx = new TxMsgValue(properties.tx);
    this.source = properties.source;
    this.receiver = properties.receiver;
    this.token = properties.token;
    this.sub_prefix = properties.subPrefix;
    this.amount = new BN(properties.amount.toString(), 64);
    this.port_id = properties.portId;
    this.channel_id = properties.channelId;
    this.timeout_height = timeoutHeight;
    this.timeout_sec_offset = timeoutSecOffset;
  }
}

const IbcTransferMsgSchema: [unknown, unknown] = [
  IbcTransferMsgValue,
  {
    kind: "struct",
    fields: [
      ["tx", TxMsgValue],
      ["source", "string"],
      ["receiver", "string"],
      ["token", "string"],
      ["sub_prefix", { kind: "option", type: "string" }],
      ["amount", "u64"],
      ["port_id", "string"],
      ["channel_id", "string"],
      ["timeout_height", { kind: "option", type: "u64" }],
      ["timeout_sec_offset", { kind: "option", type: "u64" }],
    ],
  },
];

export const SubmitIbcTransferMsgSchema = new Map([
  TxMsgSchema,
  IbcTransferMsgSchema,
]) as Schema;
