import {
  Message,
  MessageSender,
  RoutedMessage,
  Result as RouterResult,
} from "../router";
import browser from "webextension-polyfill";

export type Callback = (
  message: RoutedMessage,
  sender: MessageSender
) => Promise<RouterResult | void>;

export type Result<M> = {
  error?: { message: string, stack: string };
  return: Promise<M extends Message<infer R> ? R : never>;
};

export interface Messenger {
  addListener(callback: Callback): void;
  removeListener(callback: Callback): void;
  sendMessage<M extends Message<unknown>>(payload: RoutedMessage<M>): Promise<Result<M>>;
}

export class ExtensionMessenger implements Messenger {
  addListener(callback: Callback): void {
    browser.runtime.onMessage.addListener(callback);
  }

  removeListener(callback: Callback): void {
    browser.runtime.onMessage.removeListener(callback);
  }

  sendMessage<M extends Message<unknown>>(
    payload: RoutedMessage<M>
  ): Promise<Result<M>> {
    return browser.runtime.sendMessage(payload);
  }
}
