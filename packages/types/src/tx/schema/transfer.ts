import BN from "bn.js";
import { Schema } from "borsh";
import { TransferProps } from "../types";
import { TxMsgSchema, TxMsgValue } from "./tx";
import { SchemaObject } from "@anoma/utils";

export class TransferMsgValue {
  tx: TxMsgValue;
  source: string;
  target: string;
  token: string;
  sub_prefix?: string;
  amount: BN;
  native_token: string;

  constructor(properties: TransferProps | SchemaObject<typeof TransferMsgSchema>) {
    this.tx = properties.tx instanceof TxMsgValue ?
      properties.tx :
      new TxMsgValue(properties.tx);
    this.source = properties.source;
    this.target = properties.target;
    this.token = properties.token;
    this.sub_prefix =
      'subPrefix' in properties ? properties.subPrefix :
        'sub_prefix' in properties ? properties.sub_prefix :
          undefined;
    this.amount = properties.amount instanceof BN ?
      properties.amount :
      new BN(properties.amount.toString());
    this.native_token = 'nativeToken' in properties ?
      properties.nativeToken :
      properties.native_token;
  }
}

export const TransferMsgSchema = [
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
] as const; // needed for SchemaObject to deduce types correctly

export const SubmitTransferMsgSchema = new Map([
  TxMsgSchema as [unknown, unknown],
  TransferMsgSchema as [unknown, unknown],
]) as Schema;
