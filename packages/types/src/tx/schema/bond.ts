import BN from "bn.js";
import { BondProps, Tx } from "../types";

export class BondMsgValue {
  source: string;
  validator: string;
  amount: BN;
  tx_code: Uint8Array;

  constructor(properties: BondProps) {
    this.source = properties.source;
    this.validator = properties.validator;
    this.amount = new BN(properties.amount, 64);
    this.tx_code = properties.txCode;
  }
}

export const BondMsgSchema = new Map([
  [
    BondMsgValue,
    {
      kind: "struct",
      fields: [
        ["source", "string"],
        ["validator", "string"],
        ["amount", "u64"],
        ["tx_code", ["u8"]],
      ],
    },
  ],
]);

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

export const TxMsgSchema = new Map([
  [
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
  ],
]);
