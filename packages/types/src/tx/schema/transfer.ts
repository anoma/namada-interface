/* eslint-disable @typescript-eslint/no-unused-vars */
import { field, option, vec } from "@dao-xyz/borsh";
import BigNumber from "bignumber.js";
import {
  ShieldedTransferDataProps,
  ShieldedTransferProps,
  ShieldingTransferDataProps,
  ShieldingTransferProps,
  TransparentTransferDataProps,
  TransparentTransferProps,
  UnshieldingTransferDataProps,
  UnshieldingTransferProps,
} from "../types";
import { BigNumberSerializer } from "./utils";

/**
 * Transparent Transfer schemas
 */
export class TransparentTransferDataMsgValue {
  @field({ type: "string" })
  source!: string;

  @field({ type: "string" })
  target!: string;

  @field({ type: "string" })
  token!: string;

  @field(BigNumberSerializer)
  amount!: BigNumber;

  constructor(data: TransparentTransferDataProps) {
    Object.assign(this, data);
  }
}

export class TransparentTransferMsgValue {
  @field({ type: vec(TransparentTransferDataMsgValue) })
  data!: TransparentTransferDataMsgValue[];

  constructor({ data }: TransparentTransferProps) {
    Object.assign(this, {
      data: data.map(
        (transferProps) => new TransparentTransferDataMsgValue(transferProps)
      ),
    });
  }
}

/**
 * Shielded Transfer schemas
 */
export class ShieldedTransferDataMsgValue {
  @field({ type: "string" })
  source!: string;

  @field({ type: "string" })
  target!: string;

  @field({ type: "string" })
  token!: string;

  @field(BigNumberSerializer)
  amount!: BigNumber;

  constructor(data: ShieldedTransferDataProps) {
    Object.assign(this, data);
  }
}

export class ShieldedTransferMsgValue {
  @field({ type: vec(ShieldedTransferDataMsgValue) })
  data!: ShieldedTransferDataMsgValue[];

  @field({ type: vec("string") })
  gasSpendingKeys!: string[];

  constructor({ data }: ShieldedTransferProps) {
    Object.assign(this, {
      data: data.map(
        (shieldedTransferProps) =>
          new ShieldedTransferDataMsgValue(shieldedTransferProps)
      ),
    });
  }
}

/**
 * Shielding Transfer schemas
 */
export class ShieldingTransferDataMsgValue {
  @field({ type: "string" })
  source!: string;

  @field({ type: "string" })
  token!: string;

  @field(BigNumberSerializer)
  amount!: BigNumber;

  constructor(data: ShieldingTransferDataProps) {
    Object.assign(this, data);
  }
}

export class ShieldingTransferMsgValue {
  @field({ type: vec(ShieldingTransferDataMsgValue) })
  data!: ShieldingTransferDataMsgValue[];

  constructor({ data }: ShieldingTransferProps) {
    Object.assign(this, {
      data: data.map(
        (shieldingTransferProps) =>
          new ShieldingTransferDataMsgValue(shieldingTransferProps)
      ),
    });
  }
}

/**
 * Unshielding Transfer schemas
 */
export class UnshieldingTransferDataMsgValue {
  @field({ type: "string" })
  target!: string;

  @field({ type: "string" })
  token!: string;

  @field(BigNumberSerializer)
  amount!: BigNumber;

  constructor(data: UnshieldingTransferDataProps) {
    Object.assign(this, data);
  }
}

export class UnshieldingTransferMsgValue {
  @field({ type: "string" })
  source!: string;

  @field({ type: vec(UnshieldingTransferDataMsgValue) })
  data!: UnshieldingTransferDataMsgValue[];

  @field({ type: vec("string") })
  gasSpendingKeys!: string[];

  constructor({ data }: UnshieldingTransferProps) {
    Object.assign(this, {
      data: data.map(
        (unshieldingTransferProps) =>
          new UnshieldingTransferDataMsgValue(unshieldingTransferProps)
      ),
    });
  }
}

/**
 * General Transfer schema used for displaying details
 */
export class TransferDataMsgValue {
  @field({ type: "string" })
  owner!: string;

  @field({ type: "string" })
  token!: string;

  @field(BigNumberSerializer)
  amount!: BigNumber;
}

export class TransferMsgValue {
  @field({ type: vec(TransferDataMsgValue) })
  sources!: TransferDataMsgValue[];

  @field({ type: vec(TransferDataMsgValue) })
  targets!: TransferDataMsgValue[];

  @field({ type: option(vec("u8")) })
  shieldedSectionHash?: Uint8Array;
}
