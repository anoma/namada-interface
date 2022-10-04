export class TransferMsgValue {
  source: string;
  target: string;
  token: string;
  amount: number;

  constructor(properties: {
    source: string;
    target: string;
    token: string;
    amount: number;
  }) {
    this.source = properties.source;
    this.target = properties.target;
    this.token = properties.token;
    this.amount = properties.amount;
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
        ["amount", "u32"],
      ],
    },
  ],
]);
