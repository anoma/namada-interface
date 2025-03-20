/* eslint-disable @typescript-eslint/no-unused-vars */
import { field, vec } from "@dao-xyz/borsh";

export class BparamsSpendMsgValue {
  @field({ type: vec("u8") })
  rcv!: Uint8Array;

  @field({ type: vec("u8") })
  alpha!: Uint8Array;

  constructor(data: BparamsSpendMsgValue) {
    Object.assign(this, data);
  }
}

export class BparamsOutputMsgValue {
  @field({ type: vec("u8") })
  rcv!: Uint8Array;

  @field({ type: vec("u8") })
  rcm!: Uint8Array;

  constructor(data: BparamsOutputMsgValue) {
    Object.assign(this, data);
  }
}

export class BparamsConvertMsgValue {
  @field({ type: vec("u8") })
  rcv!: Uint8Array;

  constructor(data: BparamsConvertMsgValue) {
    Object.assign(this, data);
  }
}

export class BparamsMsgValue {
  @field({ type: BparamsSpendMsgValue })
  spend!: BparamsSpendMsgValue;

  @field({ type: BparamsOutputMsgValue })
  output!: BparamsOutputMsgValue;

  @field({ type: BparamsConvertMsgValue })
  convert!: BparamsConvertMsgValue;

  constructor(data: BparamsMsgValue) {
    Object.assign(this, data);
  }
}
