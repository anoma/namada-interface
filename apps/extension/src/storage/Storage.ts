import { KVStore } from "@namada/storage";

export abstract class ExtStorage {
  constructor(private readonly provider: KVStore<unknown>) {}

  protected async getRaw<T>(key: string): Promise<T | undefined> {
    const data = await this.provider.get<T>(key);
    return data;
  }

  protected async setRaw<T>(key: string, value: T): Promise<void> {
    await this.provider.set(key, value);
  }
}
