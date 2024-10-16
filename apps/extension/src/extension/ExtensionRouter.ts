import { serializeBigNumbers } from "@namada/utils/helpers";
import {
  EnvProducer,
  MessageSender,
  Result,
  RoutedMessage,
  Router,
} from "router";
import { LocalStorage } from "storage";
import { Messenger } from "./ExtensionMessenger";
import { getNamadaRouterId } from "./utils";

export class ExtensionRouter extends Router {
  constructor(
    envProducer: EnvProducer,
    private readonly messenger: Messenger,
    private readonly store: LocalStorage
  ) {
    super(envProducer);
  }

  listen(port: string, initPromise: Promise<void>): void {
    if (!port) {
      throw new Error("Empty port");
    }

    // eslint-disable-next-line no-console
    console.info(`Listening on port ${port}`);
    this.port = port;
    this.messenger.addListener(async (message, sender) =>
      initPromise.then(() => this.onMessage(message, sender))
    );
  }

  unlisten(): void {
    this.port = "";
    this.messenger.removeListener(this.onMessage);
  }

  protected onMessage = async (
    message: RoutedMessage,
    sender: MessageSender
  ): Promise<Result | void> => {
    if (message.port !== this.port) {
      return;
    }

    if (
      message.msg?.meta?.routerId &&
      message.msg.meta.routerId !== (await getNamadaRouterId(this.store))
    ) {
      return;
    }

    return await this.onMessageHandler(message, sender);
  };

  protected async onMessageHandler(
    message: RoutedMessage,
    sender: MessageSender
  ): Promise<Result> {
    try {
      const result = await this.handleMessage(message, sender);
      serializeBigNumbers(result);
      return {
        return: result,
      };
    } catch (e) {
      if (!(e instanceof Error)) {
        throw e;
      }
      // Error is not JSON-ifiable so we make a new object with the
      // data needed to reconstruct the Error later.
      // See https://github.com/anoma/namada-interface/issues/139
      const { message, stack } = e;
      return Promise.resolve({ error: { message, stack } });
    }
  }
}
