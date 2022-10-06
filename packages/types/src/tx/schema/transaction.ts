import BN from "bn.js";

export class TransactionMsgValue {
  token: string;
  epoch: BN;
  fee_amount: BN;
  gas_limit: BN;
  tx_code: Uint8Array;

  constructor(properties: {
    token: string;
    epoch: number;
    fee_amount: number;
    gas_limit: number;
    tx_code: Uint8Array;
  }) {
    this.token = properties.token;
    this.epoch = new BN(properties.epoch, 64);
    this.fee_amount = new BN(properties.fee_amount, 64);
    this.gas_limit = new BN(properties.gas_limit, 64);
    this.tx_code = properties.tx_code;
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
        ["tx_code", []],
      ],
    },
  ],
]);
