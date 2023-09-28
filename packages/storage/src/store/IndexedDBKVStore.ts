import { KVStore } from "./types";

export class IndexedDBKVStore<T> implements KVStore<T> {
  protected cachedDB?: IDBDatabase;

  constructor(protected readonly _prefix: string) {}

  public async get<U extends T>(key: string): Promise<U | undefined> {
    const tx = (await this.getDB()).transaction([this.prefix()], "readonly");
    const store = tx.objectStore(this.prefix());

    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onerror = (event) => {
        event.stopPropagation();

        reject(event.target);
      };
      request.onsuccess = () => {
        if (!request.result) {
          resolve(undefined);
        } else {
          resolve(request.result.data);
        }
      };
    });
  }

  public async set<U extends T>(key: string, data: U | null): Promise<void> {
    if (data === null) {
      const tx = (await this.getDB()).transaction(
        [this.prefix()],
        "readwrite",
        { durability: "strict" }
      );
      const store = tx.objectStore(this.prefix());

      return new Promise((resolve, reject) => {
        const request = store.delete(key);
        request.onerror = (event) => {
          event.stopPropagation();

          reject(event.target);
        };
        request.onsuccess = () => {
          resolve();
        };
      });
    } else {
      const tx = (await this.getDB()).transaction(
        [this.prefix()],
        "readwrite",
        { durability: "strict" }
      );
      const store = tx.objectStore(this.prefix());

      return new Promise((resolve, reject) => {
        const request = store.put({
          key,
          data,
        });
        request.onerror = (event) => {
          event.stopPropagation();

          reject(event.target);
        };
        request.onsuccess = () => {
          resolve();
        };
      });
    }
  }

  public prefix(): string {
    return this._prefix;
  }

  protected async getDB(): Promise<IDBDatabase> {
    if (this.cachedDB) {
      return this.cachedDB;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.prefix());
      request.onerror = (event) => {
        event.stopPropagation();
        reject(event.target);
      };

      request.onupgradeneeded = (event) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const db = event.target.result;

        db.createObjectStore(this.prefix(), { keyPath: "key" });
      };

      request.onsuccess = () => {
        this.cachedDB = request.result;
        resolve(request.result);
      };
    });
  }
}
