import { Runtime } from "webextension-polyfill";
import { Message } from "../Message";

export type MessageSender = Pick<Runtime.MessageSender, "id" | "url" | "tab">;

export interface Env {
  readonly isInternalMsg: boolean;
  readonly senderTabId: number;
  readonly requestInteraction: () => void;
}

export type FnRequestInteraction = <M extends Message<unknown>>(
  url: string,
  msg: M,
  options?: FnRequestInteractionOptions
) => Promise<M extends Message<infer R> ? R : never>;

export type FnRequestInteractionOptions = {
  forceOpenWindow?: boolean;
  channel?: string;
};

export type EnvProducer = (
  sender: MessageSender,
  routerMeta: Record<string, string | number | undefined>
) => Env;

export interface MessageRequester {
  sendMessage<M extends Message<unknown>>(
    port: string,
    msg: M
  ): Promise<M extends Message<infer R> ? R : never>;
}

export type Guard = (
  env: Omit<Env, "requestInteraction">,
  msg: Message<unknown>,
  sender: MessageSender
) => Promise<void>;

export type Result = {
  return?: unknown;
  error?: unknown;
};

export type RoutedMessage<T = Message<unknown>> = {
  msg: T;
  type: string;
  port: string;
};
