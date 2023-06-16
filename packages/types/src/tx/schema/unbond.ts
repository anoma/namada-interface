import BN from "bn.js";
import { Schema } from "borsh";
import { SubmitUnbondProps } from "../types";
import { TxMsgSchema, TxMsgValue } from "./tx";

export class SubmitUnbondMsgValue {
  source: string;
  validator: string;
  amount: BN;
  tx: TxMsgValue;

  constructor(properties: SubmitUnbondProps) {
    this.source = properties.source;
    this.validator = properties.validator;
    this.amount = new BN(properties.amount.toString());
    this.tx = new TxMsgValue(properties.tx);
  }
}

export const UnbondMsgSchema: [unknown, unknown] = [
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
];

export const SubmitUnbondMsgSchema = new Map([
  TxMsgSchema,
  UnbondMsgSchema,
]) as Schema;
