import browser from "webextension-polyfill";
import { getAnomaRouterId } from "../utils";
import { Router } from "./Router";
import { MessageSender, EnvProducer, Result } from "../types";

export class ExtensionRouter extends Router {
  constructor(envProducer: EnvProducer) {
    super(envProducer);
  }

  listen(port: string): void {
    if (!port) {
      throw new Error("Empty port");
    }

    this.port = port;
    browser.runtime.onMessage.addListener(this.onMessage);
  }

  unlisten(): void {
    this.port = "";
    browser.runtime.onMessage.removeListener(this.onMessage);
  }

  // You shouldn't set this handler as async funtion,
  // because mozila's extension polyfill deals with the message handler as resolved if it returns the `Promise`.
  // So, if this handler is async function, it always return the `Promise` if it returns `undefined` and it is dealt with as resolved.
  protected onMessage = (
    message: any,
    sender: MessageSender
  ): Promise<Result> | undefined => {
    if (message.port !== this.port) {
      return;
    }

    // The receiverRouterId will be set when requesting an interaction from the background to the frontend.
    // If this value exists, it compares this value with the current router id and processes them only if they are the same.
    if (
      message.msg?.meta?.receiverRouterId &&
      message.msg.meta.receiverRouterId !== getAnomaRouterId()
    ) {
      return;
    }

    return this.onMessageHandler(message, sender);
  };

  protected async onMessageHandler(
    message: any,
    sender: MessageSender
  ): Promise<any> {
    try {
      const result = await this.handleMessage(message, sender);
      return {
        return: result,
      };
    } catch (e) {
      console.log(`Failed to process msg ${message.type}: ${e}`);
      return Promise.resolve({ error: e });
    }
  }
}
