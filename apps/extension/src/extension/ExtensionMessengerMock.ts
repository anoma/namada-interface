import { Message, RoutedMessage } from "router";
import { Callback, Messenger, Result } from "./ExtensionMessenger";

export class ExtensionMessengerMock implements Messenger {
  // Set might influence the order of callbacks, change to array if needed
  private callbacks: Set<Callback> = new Set();

  addListener(callback: Callback): void {
    this.callbacks.add(callback);
  }

  removeListener(callback: Callback): void {
    this.callbacks.delete(callback);
  }

  async sendMessage<M extends Message<unknown>>(
    payload: RoutedMessage<M>
  ): Promise<Result<M>> {
    const promise = Array.from(this.callbacks)[0](payload, {});

    // We have to cast because listeners return types are different than
    // sendMessage one
    return promise as Promise<Result<M>>;
  }
}
