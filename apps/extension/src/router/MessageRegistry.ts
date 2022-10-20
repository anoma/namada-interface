import { Message } from "./Message";
import { RoutedMessage } from "./types";

export class MessageRegistry {
  private registeredMsgType: Map<string, { new (): Message<unknown> }> =
    new Map();

  registerMessage<T = unknown>(
    msgCls: { new (...args: T[]): Message<unknown> } & { type(): string }
  ): void {
    if (this.registeredMsgType.has(msgCls.type())) {
      throw new Error(`Already registered type ${msgCls.type()}`);
    }
    this.registeredMsgType.set(msgCls.type(), msgCls);
  }

  parseMessage(message: RoutedMessage): Message<unknown> {
    if (!message.type) {
      throw new Error("Null type");
    }

    const msgCls = this.registeredMsgType.get(message.type);
    if (!msgCls) {
      throw new Error(`Unregistered msg type ${message.type}`);
    }
    return Object.setPrototypeOf(
      message.msg,
      msgCls.prototype
    ) as Message<unknown>;
  }
}
