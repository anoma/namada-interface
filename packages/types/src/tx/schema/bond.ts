import BN from "bn.js";
import { Schema } from "borsh";
import { SubmitBondProps } from "../types";
import { TxMsgSchema, TxMsgValue } from "./tx";
import { SchemaObject } from "@anoma/utils";

export class BondMsgValue {
  source: string;
  validator: string;
  amount: BN;
  native_token: string;
  tx: TxMsgValue;

  constructor(
    properties: SubmitBondProps | SchemaObject<typeof BondMsgSchema>
  ) {
    this.source = properties.source;
    this.validator = properties.validator;
    this.amount = new BN(properties.amount.toString());
    this.native_token =
      "nativeToken" in properties
        ? properties.nativeToken
        : properties.native_token;
    this.tx = new TxMsgValue(properties.tx);
  }
}

export const BondMsgSchema = [
  BondMsgValue,
  {
    kind: "struct",
    fields: [
      ["source", "string"],
      ["validator", "string"],
      ["amount", "u64"],
      ["native_token", "string"],
      ["tx", TxMsgValue],
    ],
  },
] as const; // needed for SchemaObject to deduce types correctly

export const SubmitBondMsgSchema = new Map([
  TxMsgSchema as [unknown, unknown],
  BondMsgSchema as [unknown, unknown],
]) as Schema;
