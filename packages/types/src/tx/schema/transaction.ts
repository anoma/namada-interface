export class TransactionMsgValue {
  secret: string;
  token: string;
  epoch: number;
  fee_amount: number;
  gas_limit: number;
  tx_code: Uint8Array;

  constructor(properties: {
    secret: string;
    token: string;
    epoch: number;
    fee_amount: number;
    gas_limit: number;
    tx_code: Uint8Array;
  }) {
    this.secret = properties.secret;
    this.token = properties.token;
    this.epoch = properties.epoch;
    this.fee_amount = properties.fee_amount;
    this.gas_limit = properties.gas_limit;
    this.tx_code = properties.tx_code;
  }
}

export const TransactionMsgSchema = new Map([
  [
    TransactionMsgValue,
    {
      kind: "struct",
      fields: [
        ["secret", "string"],
        ["token", "string"],
        ["epoch", "u32"],
        ["fee_amount", "u32"],
        ["gas_limit", "u32"],
        ["tx_code", []],
      ],
    },
  ],
]);
