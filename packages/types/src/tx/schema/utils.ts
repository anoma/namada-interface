import BigNumber from "bignumber.js";
import { BinaryWriter, BinaryReader } from "@dao-xyz/borsh";

export const BigNumberSerializer = {
  serialize: (value: BigNumber, writer: BinaryWriter) => {
    writer.string(value.toString());
  },
  deserialize: (reader: BinaryReader): BigNumber => {
    const valueString = reader.string();
    return new BigNumber(valueString);
  },
};
