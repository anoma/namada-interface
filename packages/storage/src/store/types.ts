export interface KVStore {
  get<T = unknown>(key: string): Promise<T | undefined>;
  set<T = unknown>(key: string, data: T | null): Promise<void>;
  prefix(): string;
}

export interface KVStoreProvider {
  // TODO: Strongly type KVStoreProvider
  // eslint-disable-next-line
  get(): Promise<{ [key: string]: any }>;
  // TODO: Strongly type KVStoreProvider
  // eslint-disable-next-line
  set(items: { [key: string]: any }): Promise<void>;
}
