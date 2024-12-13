/* eslint-disable @typescript-eslint/no-unused-vars */
import { field, option, vec } from "@dao-xyz/borsh";
import { SigningDataProps, TxProps } from "../types";
import { WrapperTxMsgValue } from "./wrapperTx";

export class SigningDataMsgValue {
  @field({ type: option("string") })
  owner?: string;

  @field({ type: vec("string") })
  publicKeys!: string[];

  @field({ type: "u8" })
  threshold!: number;

  // Contains a borsh-serialized AccountPublicKeysMap
  // TODO: We may be able to deserialize this further and
  // restore the original HashMap, but for now, just store
  // the vec of the serialized HashMap
  @field({ type: option(vec("u8")) })
  accountPublicKeysMap?: Uint8Array;

  @field({ type: "string" })
  feePayer!: string;

  @field({ type: option(vec("u8")) })
  shieldedHash?: Uint8Array;

  @field({ type: option(vec("u8")) })
  masp?: Uint8Array;

  constructor(data: SigningDataProps) {
    Object.assign(this, data);
  }
}

export class TxMsgValue {
  @field({ type: WrapperTxMsgValue })
  args!: WrapperTxMsgValue;

  @field({ type: "string" })
  hash!: string;

  @field({ type: vec("u8") })
  bytes!: Uint8Array;

  @field({ type: vec(SigningDataMsgValue) })
  signingData!: SigningDataMsgValue[];

  constructor(data: TxProps) {
    Object.assign(this, {
      ...data,
      args: new WrapperTxMsgValue(data.args),
      signingData: data.signingData.map(
        (props) => new SigningDataMsgValue(props)
      ),
    });
  }
}
