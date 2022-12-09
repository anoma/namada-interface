import BN from "bn.js";
import { TxProps } from "../types";

export class TransactionMsgValue {
  token: string;
  epoch: BN;
  fee_amount: BN;
  gas_limit: BN;
  tx_code: Uint8Array;
  sign_inner: boolean;

  constructor(properties: TxProps) {
    this.token = properties.token;
    this.epoch = new BN(properties.epoch, 64);
    this.fee_amount = new BN(properties.feeAmount, 64);
    this.gas_limit = new BN(properties.gasLimit, 64);
    this.tx_code = properties.txCode;
    this.sign_inner = properties.signInner;
  }
}

export const TransactionMsgSchema = new Map([
  [
    TransactionMsgValue,
    {
      kind: "struct",
      fields: [
        ["token", "string"],
        ["epoch", "u64"],
        ["fee_amount", "u64"],
        ["gas_limit", "u64"],
        ["tx_code", ["u8"]],
        ["sign_inner", "u8"],
      ],
    },
  ],
]);
