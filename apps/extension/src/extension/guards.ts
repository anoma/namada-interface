import { Env, Guard, MessageSender, Message } from "router";

export class ContentScriptGuards {
  // Router in content script will reject all messages that can be sent from the external.
  static readonly checkMessageIsInternal: Guard = (
    env: Omit<Env, "requestInteraction">,
    msg: Message<unknown>,
    sender: MessageSender
  ): Promise<void> => {
    if (!env.isInternalMsg || msg.approveExternal(env, sender)) {
      throw new Error(
        "Content script can't handle the message that is able to be sent from external"
      );
    }

    return Promise.resolve();
  };
}

export class ExtensionGuards {
  static readonly checkOriginIsValid: Guard = (
    _: Omit<Env, "requestInteraction">,
    msg: Message<unknown>,
    sender: MessageSender
  ): Promise<void> => {
    // TODO: When is a url undefined?
    if (!sender.url) {
      throw new Error("url is empty");
    }

    if (!msg.origin) {
      throw new Error("origin is empty");
    }

    const url = new URL(sender.url);
    if (url.origin !== msg.origin) {
      throw new Error("Invalid origin");
    }
    return Promise.resolve();
  };

  static readonly checkMessageIsInternal: Guard = (
    env: Omit<Env, "requestInteraction">,
    msg: Message<unknown>,
    sender: MessageSender
  ): Promise<void> => {
    if (!env.isInternalMsg && !msg.approveExternal(env, sender)) {
      throw new Error("Permission rejected");
    }
    return Promise.resolve();
  };
}
