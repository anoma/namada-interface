import { BinaryReader, BinaryWriter } from "@dao-xyz/borsh";
import BigNumber from "bignumber.js";

export const BigNumberSerializer = {
  serialize: (value: BigNumber, writer: BinaryWriter) => {
    //eslint-disable-next-line
    console.log("TODO: hacky hack hack");
    const asd = Object.setPrototypeOf(value, BigNumber.prototype);
    writer.string(asd.toString());
  },
  deserialize: (reader: BinaryReader): BigNumber => {
    const valueString = reader.string();
    return new BigNumber(valueString);
  },
};
