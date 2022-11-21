import PubSub from 'pubsub-js';

import {
  ExtensionRouter,
  ExtensionGuards,
  ContentScriptEnv,
} from "../extension";
import {
  Ports,
  KVPrefix,
  Router,
  EnvProducer,
  RoutedMessage,
  MessageSender,
  Result,
} from "../router";
import { chains } from "../config";
import { ChainsService, init as initChains } from "../background/chains";
import {
  KeyRingService,
  init as initKeyRing,
  KeyStore,
  Argon2Params,
} from "../background/keyring";

import { KVStore } from "@anoma/storage";
import { Chain } from "@anoma/types";
import { subscribe } from "./pubsub";

class KvStoreChainMock implements KVStore<Chain> {
  private storage: { [key: string]: Chain[] | null } = {};

  constructor(private readonly _prefix: string) {}

  get(key: string): Promise<Chain[] | undefined> {
    return Promise.resolve(this.storage[key] || undefined);
  }
  set(key: string, data: Chain[] | null): Promise<void> {

    this.storage[key] = data;
    return Promise.resolve();
  }
  prefix(): string {
    return this._prefix;
  }
}

class KvStoreKeyMock implements KVStore<KeyStore> {
  private storage: { [key: string]: KeyStore<Argon2Params>[] } = {};

  constructor(private readonly _prefix: string) {}

  get(key: string): Promise<KeyStore<Argon2Params>[]> {
    return Promise.resolve(this.storage[key] || undefined);
  }
  set(key: string, data: KeyStore<Argon2Params>[]): Promise<void> {

    this.storage[key] = data;
    return Promise.resolve();
  }
  prefix(): string {
    return this._prefix;
  }
}

export class ExtensionRouterMock extends ExtensionRouter {
  constructor(envProducer: EnvProducer) {
    super(envProducer);
  }

  listen(port: string): void {
    if (!port) {
      throw new Error("Empty port");
    }

    console.info(`Listening on port ${port}`);
    this.port = port;

    PubSub.subscribe('message', (_, data) => this.onMessage(data, {}))
  }

  unlisten(): void {
    this.port = "";
    browser.runtime.onMessage.removeListener(this.onMessage);
  }

  // protected onMessage = async (
  //   message: RoutedMessage,
  //   sender: MessageSender
  // ): Promise<Result | void> => {
  //   return super.onMessage(message, sender);
  // };

  protected async onMessageHandler(
    message: RoutedMessage,
    sender: MessageSender
  ): Promise<Result> {
    return super.onMessageHandler(message, sender);
  }
}

export const init = (): {store: KvStoreChainMock} => {
  const store = new KvStoreChainMock(KVPrefix.IndexedDB);
  const store2 = new KvStoreKeyMock(KVPrefix.IndexedDB);
  const router = new ExtensionRouterMock(() => ({
    isInternalMsg: true,
    requestInteraction: () => {
      throw new Error("Test env doesn't support `requestInteraction`");
    },
  }));
  // router.addGuard(ExtensionGuards.checkOriginIsValid);
  // router.addGuard(ExtensionGuards.checkMessageIsInternal);

  const chainsService = new ChainsService(store, chains);
  const keyRingService = new KeyRingService(store2);

  // Initialize messages and handlers
  initChains(router, chainsService);
  initKeyRing(router, keyRingService);

  router.listen(Ports.Background);

  return {
      store
  }
};
