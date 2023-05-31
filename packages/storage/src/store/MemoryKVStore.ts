/**
 * In-memory key-value store which implements KVStore interface using a Map.
 * See: https://github.com/anoma/namada-interface/blob/main/packages/storage/src/store/types.ts
 */
import { KVStore } from "./types";

export class MemoryKVStore<T> implements KVStore<T[]> {
  private _store = new Map();

  constructor(private readonly _prefix: string) { }

  public get<T = unknown>(key: string): Promise<T | undefined> {
    const k = this.prefix() + "/" + key;
    const data = this._store.get(k);

    if (!data) {
      return Promise.resolve(undefined);
    }

    return Promise.resolve(data as T);
  }

  public set<T = unknown>(key: string, data: T | null): Promise<void> {
    const k = this.prefix() + "/" + key;

    if (data === null) {
      if (this._store.has(k)) {
        this._store.delete(k);
      }
      return Promise.resolve();
    }
    this._store.set(k, data);
    return Promise.resolve();
  }

  public prefix(): string {
    return this._prefix;
  }
}
