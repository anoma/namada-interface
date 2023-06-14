import BN from "bn.js";
import { Schema } from "borsh";
import { TransferProps } from "../types";
import { TxMsgSchema, TxMsgValue } from "./tx";

export class TransferMsgValue {
  tx: TxMsgValue;
  source: string;
  target: string;
  token: string;
  sub_prefix?: string;
  amount: BN;
  native_token: string;

  constructor(properties: TransferProps) {
    this.tx = new TxMsgValue(properties.tx);
    this.source = properties.source;
    this.target = properties.target;
    this.token = properties.token;
    this.sub_prefix = properties.subPrefix;
    this.amount = new BN(properties.amount.toString(), 64);
    this.native_token = properties.nativeToken;
  }
}

export const TransferMsgSchema: [unknown, unknown] = [
  TransferMsgValue,
  {
    kind: "struct",
    fields: [
      ["tx", TxMsgValue],
      ["source", "string"],
      ["target", "string"],
      ["token", "string"],
      ["sub_prefix", { kind: "option", type: "string" }],
      ["amount", "u64"],
      ["native_token", "string"],
    ],
  },
];

export const SubmitTransferMsgSchema = new Map([
  TxMsgSchema,
  TransferMsgSchema,
]) as Schema;
