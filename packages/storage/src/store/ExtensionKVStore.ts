/* import browser from "webextension-polyfill"; */
import { KVStore, KVStoreProvider } from "./types";

export class ExtensionKVStore implements KVStore {
  constructor(
    protected readonly _prefix: string,
    protected readonly provider: KVStoreProvider
  ) {}

  public async get<T = unknown>(key: string): Promise<T | undefined> {
    const k = this.prefix() + "/" + key;

    const data = await this.provider.get();
    return data[k];
  }

  public set<T = unknown>(key: string, data: T | null): Promise<void> {
    const k = this.prefix() + "/" + key;

    return this.provider.set({ [k]: data });
  }

  public prefix(): string {
    return this._prefix;
  }
}
