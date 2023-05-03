import { KVStore } from "./types";

export class MemoryKVStore<T> implements KVStore<T[]> {
  private _store = new Map();

  constructor(private readonly _prefix: string) {}

  public get<T = unknown>(key: string): Promise<T | undefined> {
    const k = this.prefix() + "/" + key;
    const data = this._store.get(k);

    console.log("MemoryKVStore.get()", k);
    if (data === null) {
      return Promise.resolve(undefined);
    }

    return Promise.resolve(data as T);
  }

  public set<T = unknown>(key: string, data: T | null): Promise<void> {
    const k = this.prefix() + "/" + key;

    console.log("MemoryKVStore.set()", k, data);
    if (data === null) {
      // Unset value if it exists
      const value = this._store.get(k);
      if (value) {
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
