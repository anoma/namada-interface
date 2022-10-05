import {
  serialize,
  deserialize,
  BinaryReader,
  BinaryWriter,
  Schema,
} from "borsh";

export type ClassType<T> = {
  new (args: any): T;
};

export interface IMessage<T> {
  encode(schema: Schema, value: T): Uint8Array;
  decode(schema: Schema, buffer: Uint8Array, parser: ClassType<T>): T;
}

export class Message<T> implements IMessage<T> {
  public encode(schema: Schema, value: T): Uint8Array {
    try {
      return serialize(schema, value, BinaryWriter);
    } catch (e) {
      throw new Error(`Unable to serialize message: ${e}`);
    }
  }

  public decode(schema: Schema, buffer: Uint8Array, parser: ClassType<T>): T {
    try {
      return deserialize(schema, parser, Buffer.from(buffer), BinaryReader);
    } catch (e) {
      throw new Error(`Unable to deserialize message: ${e}`);
    }
  }
}
