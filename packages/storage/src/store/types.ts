export interface KVStore<T> {
  get<U extends T>(key: string): Promise<U | undefined>;
  set<U extends T>(key: string, data: U | null): Promise<void>;
  prefix(): string;
}

export interface KVStoreProvider {
  get(): Promise<{ [key: string]: unknown }>;
  set(items: { [key: string]: unknown }): Promise<void>;
}
