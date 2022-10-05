import BN from "bn.js";

export class IbcTransferMsgValue {
  source_port: string;
  source_channel: string;
  token: string;
  sender: string;
  receiver: string;
  amount: BN;

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
    this.amount = new BN(properties.amount, 64);
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
        ["amount", "u64"],
      ],
    },
  ],
]);
