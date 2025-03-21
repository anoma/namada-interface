import browser from "webextension-polyfill";

import { deserializeBigNumbers } from "@namada/utils";
import { Message } from "../router";
import { Messenger } from "./ExtensionMessenger";

export class ExtensionRequester {
  constructor(
    private readonly messenger: Messenger,
    private readonly routerId: number
  ) {}

  async sendMessage<M extends Message<unknown>>(
    port: string,
    msg: M
  ): Promise<M extends Message<infer R> ? R : never> {
    msg.validate();
    msg.origin = origin;
    msg.meta = {
      ...msg.meta,
      routerId: this.routerId,
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
      const { message, stack } = result.error;
      const error = new Error(message);
      error.stack = stack;
      throw error;
    }

    return deserializeBigNumbers(result.return);
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
      routerId: this.routerId,
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

  async queryBrowserTabIds(): Promise<number[]> {
    const tabs = await browser.tabs.query({
      windowType: "normal",
      discarded: false,
      status: "complete",
    });

    return tabs.map((tab) => tab.id || browser.tabs.TAB_ID_NONE);
  }
}
