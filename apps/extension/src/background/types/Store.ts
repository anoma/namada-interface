import { KVStore } from "@anoma/storage";

export interface IStore<T> {
  set(state: T[]): Promise<void>;
  get(): Promise<T[]>;
  append(state: T): Promise<void>;
  update(id: string, state: T): Promise<void>;
}

// Records in storage should have a unique identifier
export type Record = { id: string };

/**
 * A class instance will be set for a specific storage key, and allow
 * get, set (override all values) and append (add a record to collection),
 * and update (update record specified by ID)
 */
export class Store<T extends Record> implements IStore<T> {
  constructor(public readonly key: string, public readonly store: KVStore) {}

  public async set(state: T[]) {
    await this.store.set<T[]>(this.key, state);
  }

  public async get(): Promise<T[]> {
    return (await this.store.get(this.key)) || [];
  }

  public async append(record: T): Promise<void> {
    await this.store.set<T[]>(this.key, [
      ...((await this.get()) || []),
      record,
    ]);
  }

  public async update(id: string, state: T): Promise<void> {
    const updated: T[] = ((await this.get()) || [])?.map((record: T) => {
      if (record.id === id) {
        return {
          ...state,
        };
      }
      return record;
    });

    await this.set(updated);
  }
}
