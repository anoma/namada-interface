export interface KVStore {
  get<T = unknown>(key: string): Promise<T | undefined>;
  set<T = unknown>(key: string, data: T | null): Promise<void>;
  prefix(): string;
}

export interface KVStoreProvider {
  get(): Promise<{ [key: string]: unknown }>;
  set(items: { [key: string]: unknown }): Promise<void>;
}
