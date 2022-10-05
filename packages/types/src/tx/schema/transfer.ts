import BN from "bn.js";

export class TransferMsgValue {
  source: string;
  target: string;
  token: string;
  amount: BN;

  constructor(properties: {
    source: string;
    target: string;
    token: string;
    amount: number;
  }) {
    this.source = properties.source;
    this.target = properties.target;
    this.token = properties.token;
    this.amount = new BN(properties.amount, 64);
  }
}

export const TransferMsgSchema = new Map([
  [
    TransferMsgValue,
    {
      kind: "struct",
      fields: [
        ["source", "string"],
        ["target", "string"],
        ["token", "string"],
        ["amount", "u64"],
      ],
    },
  ],
]);
