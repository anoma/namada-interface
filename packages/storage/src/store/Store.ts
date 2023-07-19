import { KVStore } from "@namada/storage";

// StoredRecords in storage should have a unique identifier
export type StoredRecord = { id: string };

export interface IStore<T extends StoredRecord> {
  set(state: T[]): Promise<void>;
  get(): Promise<T[]>;
  getRecord<U = string | number>(
    param: keyof T,
    value: U
  ): Promise<T | undefined>;
  getRecords<U = string | number>(
    param: keyof T,
    value: U
  ): Promise<T[] | undefined>;
  append(state: T): Promise<void>;
  update(id: string, state: Partial<T>): Promise<void>;
  remove(id: string): Promise<void>;
}

/**
 * A class instance will be set for a specific storage key, and allows:
 * get - get array of all items
 * getRecord - get single record by key and value
 * set - set or overwrite all items in storage
 * append - add a record to collection,
 * update - update record specified by ID with a partial record
 * remove - remove a record specified by ID
 */
export class Store<T extends StoredRecord> implements IStore<T> {
  constructor(
    public readonly key: string,
    public readonly store: KVStore<T[]>
  ) {}

  public async set(state: T[]): Promise<void> {
    await this.store.set(this.key, state);
  }

  public async get(): Promise<T[]> {
    return (await this.store.get(this.key)) || [];
  }

  public async getRecord<U = string | number>(
    param: keyof T,
    value: U
  ): Promise<T | undefined> {
    return (await this.get()).find((record: T) => record[param] === value);
  }

  public async getRecords<U = string | number>(
    param: keyof T,
    value: U
  ): Promise<T[] | undefined> {
    return (await this.get()).filter((record: T) => record[param] === value);
  }

  public async append(record: T): Promise<void> {
    await this.store.set(this.key, [...((await this.get()) || []), record]);
  }

  public async update(id: string, partial: Partial<T>): Promise<void> {
    const updated: T[] = ((await this.get()) || []).map((record: T) => {
      if (record.id === id) {
        return {
          ...record,
          ...partial,
        };
      }
      return record;
    });

    await this.set(updated);
  }

  public async remove(id: string): Promise<void> {
    await this.set((await this.get()).filter((record) => record.id !== id));
  }
}
