import { Constructor, deserialize, serialize } from "@dao-xyz/borsh";
import { Schema } from "../schema";

export interface IMessage<T extends Schema> {
  encode(value: T): Uint8Array;
}

export class Message<T extends Schema> implements IMessage<T> {
  public encode(value: T): Uint8Array {
    try {
      return serialize(value);
    } catch (e) {
      throw new Error(`Unable to serialize message: ${e}`);
    }
  }

  public static decode<T extends Schema>(
    buffer: Uint8Array,
    parser: Constructor<T>
  ): T {
    try {
      return deserialize(Buffer.from(buffer), parser);
    } catch (e) {
      throw new Error(`Unable to deserialize message: ${e}`);
    }
  }
}
