import browser from "webextension-polyfill";
import { Message } from "../router";
import { Messenger } from "./ExtensionMessenger";

export class ExtensionRequester {
  constructor(
    private readonly messenger: Messenger,
    private readonly getRouterId: () => Promise<number | undefined>
  ) {}

  async sendMessage<M extends Message<unknown>>(
    port: string,
    msg: M
  ): Promise<M extends Message<infer R> ? R : never> {
    msg.validate();
    msg.origin = origin;
    msg.meta = {
      ...msg.meta,
      routerId: await this.getRouterId(),
    };

    const payload = {
      port,
      type: msg.type(),
      msg,
    };

    const result = await this.messenger.sendMessage(payload);

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
    msg.origin = origin;
    msg.meta = {
      ...msg.meta,
      routerId: await this.getRouterId(),
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

  async sendMessageToCurrentTab<M extends Message<unknown>>(
    port: string,
    msg: M
  ): Promise<M extends Message<infer R> ? R : never> {
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });

    return this.sendMessageToTab(
      tabs[0]?.id || browser.tabs.TAB_ID_NONE,
      port,
      msg
    );
  }
}
