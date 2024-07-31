import BigNumber from "bignumber.js";
import browser from "webextension-polyfill";

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

    return fixBigNumbers(result.return);
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
    const tabs = await browser.tabs.query({});

    return tabs.map((tab) => tab.id || browser.tabs.TAB_ID_NONE);
  }
}

/**
 * Searches through an object and creates BigNumbers from any object with
 * the _isBigNumber property. This is needed because BigNumbers lose their
 * prototype when sent between extension scripts in Firefox.
 *
 * Returns the object with the BigNumbers reconstructed.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fixBigNumbers = (result: any): any => {
  if (typeof result !== "object" || result === null) {
    return result;
  }

  if (result["_isBigNumber"]) {
    return BigNumber(result as BigNumber.Value);
  }

  const unseenValues = [result];

  while (unseenValues.length !== 0) {
    const obj = unseenValues.pop();
    Object.entries(obj).forEach(([key, value]) => {
      if (typeof value === "object" && value !== null) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((value as any)["_isBigNumber"]) {
          obj[key] = BigNumber(value as BigNumber.Value);
        } else {
          unseenValues.push(value);
        }
      }
    });
  }

  return result;
};
