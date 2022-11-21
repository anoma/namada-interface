import { KVStore } from "@anoma/storage";
import { getAnomaRouterId } from "../extension/utils";
import { Message } from "../router";
import { Messenger } from "./ExtensionMessenger";

export class ExtensionRequester {
  constructor(
    private readonly messenger: Messenger,
    private readonly store: KVStore<unknown>
  ) {}

  async sendMessage<M extends Message<unknown>>(
    port: string,
    msg: M
  ): Promise<M extends Message<infer R> ? R : never> {
    msg.validate();
    msg.origin = window.location.origin;
    msg.meta = {
      ...msg.meta,
      routerId: await getAnomaRouterId(this.store),
    };

    const result = await this.messenger.sendMessage({
      port,
      type: msg.type(),
      msg,
    });

    if (!result) {
      throw new Error("Null result");
    }

    if (result.error) {
      throw new Error(result.error);
    }

    return result.return;
  }

  async sendMessageToTab<M extends Message<unknown>>(
    tabId: number,
    port: string,
    msg: M
  ): Promise<M extends Message<infer R> ? R : never> {
    msg.validate();
    msg.origin = window.location.origin;
    msg.meta = {
      ...msg.meta,
      routerId: await getAnomaRouterId(this.store),
    };

    const result = await browser.tabs.sendMessage(tabId, {
      port,
      type: msg.type(),
      msg,
    });

    if (!result) {
      throw new Error("Null result");
    }

    if (result.error) {
      throw new Error(result.error);
    }

    return result.return;
  }
}
