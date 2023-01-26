import BN from "bn.js";
import { Schema } from "borsh";
import { SubmitBondProps, Tx } from "../types";

//TODO: move somewhere else
export class TxMsgValue {
  token: string;
  fee_amount: BN;
  gas_limit: BN;
  tx_code: Uint8Array;

  constructor(properties: Tx) {
    this.token = properties.token;
    this.fee_amount = new BN(properties.feeAmount, 64);
    this.gas_limit = new BN(properties.gasLimit, 64);
    this.tx_code = properties.txCode;
  }
}

//TODO: move somewhere else
export const TxMsgSchema: [unknown, unknown] = [
  TxMsgValue,
  {
    kind: "struct",
    fields: [
      ["token", "string"],
      ["fee_amount", "u64"],
      ["gas_limit", "u64"],
      ["tx_code", ["u8"]],
    ],
  },
];

export class SubmitBondMsgValue {
  source: string;
  validator: string;
  amount: BN;
  tx_code: Uint8Array;
  native_token: string;
  tx: TxMsgValue;

  constructor(properties: SubmitBondProps) {
    this.source = properties.source;
    this.validator = properties.validator;
    this.amount = new BN(properties.amount, 64);
    this.tx_code = properties.txCode;
    this.native_token = properties.nativeToken;
    this.tx = new TxMsgValue(properties.tx);
  }
}

export const BondMsgSchema: [unknown, unknown] = [
  SubmitBondMsgValue,
  {
    kind: "struct",
    fields: [
      ["source", "string"],
      ["validator", "string"],
      ["amount", "u64"],
      ["tx_code", ["u8"]],
      ["native_token", "string"],
      ["tx", TxMsgValue],
    ],
  },
];

export const SubmitBondMsgSchema = new Map([
  TxMsgSchema,
  BondMsgSchema,
]) as Schema;
