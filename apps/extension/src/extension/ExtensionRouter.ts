import browser from "webextension-polyfill";
import { getAnomaRouterId } from "../utils";
import { Router, MessageSender, EnvProducer, Result } from "../router";

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

  protected onMessage = (
    message: any,
    sender: MessageSender
  ): Promise<Result> | undefined => {
    if (message.port !== this.port) {
      return;
    }

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
      return Promise.resolve({ error: e });
    }
  }
}
