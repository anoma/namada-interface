import BN from "bn.js";
import { Schema } from "borsh";
import { IbcTransferProps } from "../types";
import { TxMsgSchema, TxMsgValue } from "./tx";
import { SchemaObject } from "@anoma/utils";

export class IbcTransferMsgValue {
  tx: TxMsgValue;
  source: string;
  receiver: string;
  token: string;
  sub_prefix?: string;
  amount: BN;
  port_id: string;
  channel_id: string;
  timeout_height?: BN;
  timeout_sec_offset?: BN;

  constructor(properties: IbcTransferProps | SchemaObject<typeof IbcTransferMsgSchema>) {
    const timeoutHeight =
      "timeoutHeight" in properties ? properties.timeoutHeight :
        "timeout_height" in properties ? properties.timeout_height :
          undefined;

    const timeoutSecOffset =
      "timeoutSecOffset" in properties ? properties.timeoutSecOffset :
        "timeout_sec_offset" in properties ? properties.timeout_sec_offset :
          undefined;

    this.tx = new TxMsgValue(properties.tx);
    this.source = properties.source;
    this.receiver = properties.receiver;
    this.token = properties.token;
    this.sub_prefix =
      'subPrefix' in properties ? properties.subPrefix :
        'sub_prefix' in properties ? properties.sub_prefix :
          undefined;
    this.amount = new BN(properties.amount.toString());
    this.port_id = 'portId' in properties ?
      properties.portId :
      properties.port_id;
    this.channel_id = 'channelId' in properties ?
      properties.channelId :
      properties.channel_id;
    this.timeout_height =
      timeoutHeight !== undefined ? new BN(timeoutHeight) : undefined;
    this.timeout_sec_offset =
      timeoutSecOffset !== undefined ? new BN(timeoutSecOffset) : undefined;
  }
}

const IbcTransferMsgSchema = [
  IbcTransferMsgValue,
  {
    kind: "struct",
    fields: [
      ["tx", TxMsgValue],
      ["source", "string"],
      ["receiver", "string"],
      ["token", "string"],
      ["sub_prefix", { kind: "option", type: "string" }],
      ["amount", "u64"],
      ["port_id", "string"],
      ["channel_id", "string"],
      ["timeout_height", { kind: "option", type: "u64" }],
      ["timeout_sec_offset", { kind: "option", type: "u64" }],
    ],
  },
] as const; // needed for SchemaObject to deduce types correctly

export const SubmitIbcTransferMsgSchema = new Map([
  TxMsgSchema,
  IbcTransferMsgSchema as [unknown, unknown],
]) as Schema;
