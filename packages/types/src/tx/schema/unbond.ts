import BN from "bn.js";
import { Schema } from "borsh";
import { SubmitUnbondProps } from "../types";
import { TxMsgSchema, TxMsgValue } from "./tx";
import { SchemaObject } from "@anoma/utils";

export class SubmitUnbondMsgValue {
  source: string;
  validator: string;
  amount: BN;
  tx: TxMsgValue;

  constructor(properties: SubmitUnbondProps | SchemaObject<typeof UnbondMsgSchema>) {
    this.source = properties.source;
    this.validator = properties.validator;
    this.amount = new BN(properties.amount.toString());
    this.tx = new TxMsgValue(properties.tx);
  }
}

export const UnbondMsgSchema = [
  SubmitUnbondMsgValue,
  {
    kind: "struct",
    fields: [
      ["source", "string"],
      ["validator", "string"],
      ["amount", "u64"],
      ["tx", TxMsgValue],
    ],
  },
] as const; // needed for SchemaObject to deduce types correctly

export const SubmitUnbondMsgSchema = new Map([
  TxMsgSchema as [unknown, unknown],
  UnbondMsgSchema as [unknown, unknown],
]) as Schema;
