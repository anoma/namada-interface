export class IbcTransferMsgValue {
  source_port: string;
  source_channel: string;
  token: string;
  sender: string;
  receiver: string;
  amount: number;

  constructor(properties: {
    source_port: string;
    source_channel: string;
    token: string;
    sender: string;
    receiver: string;
    amount: number;
  }) {
    this.source_port = properties.source_port;
    this.source_channel = properties.source_channel;
    this.token = properties.token;
    this.sender = properties.sender;
    this.receiver = properties.receiver;
    this.amount = properties.amount;
  }
}

export const IbcTransferMsgSchema = new Map([
  [
    IbcTransferMsgValue,
    {
      kind: "struct",
      fields: [
        ["source_port", "string"],
        ["source_channel", "string"],
        ["token", "string"],
        ["sender", "string"],
        ["receiver", "string"],
        ["amount", "u32"],
      ],
    },
  ],
]);
