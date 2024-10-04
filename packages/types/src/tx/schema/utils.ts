import { BinaryReader, BinaryWriter } from "@dao-xyz/borsh";
import BigNumber from "bignumber.js";

export const BigNumberSerializer = {
  serialize: (value: BigNumber, writer: BinaryWriter) => {
    console.log("BN", value);
    const asd = Object.setPrototypeOf(value, BigNumber.prototype);
    console.log("BN2", asd);
    writer.string(asd.toString());
  },
  deserialize: (reader: BinaryReader): BigNumber => {
    const valueString = reader.string();
    return new BigNumber(valueString);
  },
};
