import { getAnomaRouterId } from "../utils";

export type Message<T> = {
  origin: string;
  port: string;
  type: () => T;
  meta: {
    routerId: number;
  };
  validate: () => void;
};

export class ExtensionMessageRequester {
  async sendMessage<M extends Message<unknown>>(
    port: string,
    msg: M
  ): Promise<M extends Message<infer R> ? R : never> {
    msg.validate();
    msg.origin = window.location.origin;
    msg.meta = {
      ...msg.meta,
      routerId: getAnomaRouterId(),
    };

    const result = await (chrome || browser).runtime.sendMessage({
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
      routerId: getAnomaRouterId(),
    };

    const result = await (chrome || browser).tabs.sendMessage(tabId, {
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
