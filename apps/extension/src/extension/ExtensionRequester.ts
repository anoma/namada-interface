import browser from "webextension-polyfill";
import { getAnomaRouterId } from "../extension/utils";
import { Message } from "../router";
import { Session } from "./Session";

export class ExtensionRequester {
  constructor(protected readonly session = new Session()) {}

  async sendMessage<M extends Message<unknown>>(
    port: string,
    msg: M
  ): Promise<M extends Message<infer R> ? R : never> {
    msg.validate();
    msg.origin = window.location.origin;
    msg.meta = {
      ...msg.meta,
      routerId: await getAnomaRouterId(),
    };

    // If message is valid, start a new session port
    this.session.start();

    const result = await browser.runtime.sendMessage({
      port,
      type: msg.type(),
      msg: msg,
    });

    if (!result) {
      throw new Error("Null result");
    }

    if (result.error) {
      throw new Error(result.error);
    }

    return result.return;
  }

  static async sendMessageToTab<M extends Message<unknown>>(
    tabId: number,
    port: string,
    msg: M
  ): Promise<M extends Message<infer R> ? R : never> {
    msg.validate();
    msg.origin = window.location.origin;
    msg.meta = {
      ...msg.meta,
      routerId: await getAnomaRouterId(),
    };

    const result = await browser.tabs.sendMessage(tabId, {
      port,
      type: msg.type(),
      msg: msg,
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
