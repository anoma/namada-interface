import browser from "webextension-polyfill";
import { getAnomaRouterId } from "./utils";
import {
  Router,
  MessageSender,
  EnvProducer,
  Result,
  RoutedMessage,
} from "router";

export class ExtensionRouter extends Router {
  constructor(envProducer: EnvProducer) {
    super(envProducer);
  }

  listen(port: string): void {
    if (!port) {
      throw new Error("Empty port");
    }

    console.info(`Listening on port ${port}`);
    this.port = port;
    browser.runtime.onMessage.addListener(this.onMessage);
  }

  unlisten(): void {
    this.port = "";
    browser.runtime.onMessage.removeListener(this.onMessage);
  }

  protected onMessage = async (
    message: any,
    sender: MessageSender
  ): Promise<Result | undefined> => {
    console.log("ExtensionRouter -> onMessage", { message, sender });
    if (message.port !== this.port) {
      return;
    }

    if (
      message.msg?.meta?.routerId &&
      message.msg.meta.routerId !== (await getAnomaRouterId())
    ) {
      return;
    }

    return await this.onMessageHandler(message, sender);
  };

  protected async onMessageHandler(
    message: RoutedMessage,
    sender: MessageSender
  ): Promise<any> {
    console.log("ExtensionRouter -> onMessageHandler", { message, sender });
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
