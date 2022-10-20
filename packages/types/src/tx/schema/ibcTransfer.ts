import BN from "bn.js";
import { IbcTransferProps } from "../types";

export class IbcTransferMsgValue {
  source_port: string;
  source_channel: string;
  token: string;
  sender: string;
  receiver: string;
  amount: BN;

  constructor(properties: IbcTransferProps) {
    this.source_port = properties.sourcePort;
    this.source_channel = properties.sourceChannel;
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
