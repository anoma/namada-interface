import browser from "webextension-polyfill";
import { KVStore } from "./types";

export class SessionKVStore<T> implements KVStore<T[]> {
  constructor(private readonly _prefix: string) {}

  public async get<T = unknown>(key: string): Promise<T | undefined> {
    const obj = await browser.storage.session.get(this.prefix());
    if (obj[this.prefix()] && obj[this.prefix()].hasOwnProperty(key)) {
      return obj[this.prefix()][key];
    }
    return undefined;
  }

  public async set<T = unknown>(key: string, data: T | null): Promise<void> {
    const obj = await browser.storage.session.get(this.prefix());
    await browser.storage.session.set({
      [this.prefix()]: { ...obj[this.prefix()], [key]: data },
    });
  }

  public prefix(): string {
    return this._prefix;
  }
}
