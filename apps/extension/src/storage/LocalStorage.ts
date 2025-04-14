import { chains } from "@namada/chains";
import { KVStore } from "@namada/storage";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import * as t from "io-ts";
import { ExtStorage } from "./Storage";

const Settings = t.type({
  showDisposableAccounts: t.boolean,
});
type SettingsType = t.TypeOf<typeof Settings>;

const ChainId = t.string;
type ChainIdType = t.TypeOf<typeof ChainId>;

const NamadaExtensionApprovedOrigins = t.array(t.string);
type NamadaExtensionApprovedOriginsType = t.TypeOf<
  typeof NamadaExtensionApprovedOrigins
>;
const NamadaExtensionRouterId = t.number;
type NamadaExtensionRouterIdType = t.TypeOf<typeof NamadaExtensionRouterId>;

const DisposableSigners = t.record(
  t.string,
  t.type({
    privateKey: t.string,
    publicKey: t.string,
    realAddress: t.string,
    timestamp: t.number,
  })
);
type DisposableSignersType = t.TypeOf<typeof DisposableSigners>;

type LocalStorageTypes =
  | ChainIdType
  | NamadaExtensionApprovedOriginsType
  | NamadaExtensionRouterIdType
  | DisposableSignersType
  | SettingsType;

type LocalStorageSchemas =
  | typeof ChainId
  | typeof NamadaExtensionApprovedOrigins
  | typeof NamadaExtensionRouterId
  | typeof DisposableSigners
  | typeof Settings;

export type LocalStorageKeys =
  | "chainId"
  | "namadaExtensionApprovedOrigins"
  | "namadaExtensionRouterId"
  | "tabs"
  | "namadaExtensionDisposableSigners"
  | "settings";

const schemasMap = new Map<LocalStorageSchemas, LocalStorageKeys>([
  [ChainId, "chainId"],
  [NamadaExtensionApprovedOrigins, "namadaExtensionApprovedOrigins"],
  [NamadaExtensionRouterId, "namadaExtensionRouterId"],
  [DisposableSigners, "namadaExtensionDisposableSigners"],
  [Settings, "settings"],
]);

export class LocalStorage extends ExtStorage {
  constructor(provider: KVStore<LocalStorageTypes>) {
    super(provider);
  }

  async getSettings(): Promise<SettingsType | undefined> {
    const data = await this.getRaw(this.getKey(Settings));

    const Schema = t.union([Settings, t.undefined]);
    const decodedData = Schema.decode(data);

    if (E.isLeft(decodedData)) {
      throw new Error("Settings are not valid");
    }

    return decodedData.right;
  }

  async setSettings(settings: SettingsType): Promise<void> {
    await this.setRaw(this.getKey(Settings), settings);
  }

  async getChainId(): Promise<ChainIdType | undefined> {
    const data = await this.getRaw(this.getKey(ChainId));

    const Schema = t.union([ChainId, t.undefined]);
    const decodedData = Schema.decode(data);

    if (E.isLeft(decodedData)) {
      // Return default chainId if invalid. Validation should not prevent this from
      // returning a value
      return chains.namada.chainId;
    }

    return decodedData.right;
  }

  async setChainId(chainId: ChainIdType): Promise<void> {
    await this.setRaw(this.getKey(ChainId), chainId);
  }

  async getApprovedOrigins(): Promise<
    NamadaExtensionApprovedOriginsType | undefined
  > {
    const data = await this.getRaw(this.getKey(NamadaExtensionApprovedOrigins));

    const Schema = t.union([NamadaExtensionApprovedOrigins, t.undefined]);
    const decodedData = Schema.decode(data);

    if (E.isLeft(decodedData)) {
      throw new Error("Approved Origins are not valid");
    }

    return decodedData.right;
  }

  async addApprovedOrigin(originToAdd: string): Promise<void> {
    const data = (await this.getApprovedOrigins()) || [];
    await this.setApprovedOrigins([...data, originToAdd]);
  }

  async removeApprovedOrigin(originToRemove: string): Promise<void> {
    const data = (await this.getApprovedOrigins()) || [];
    await this.setApprovedOrigins(
      data.filter((origin) => origin !== originToRemove)
    );
  }

  async getRouterId(): Promise<NamadaExtensionRouterIdType | undefined> {
    const data = await this.getRaw(this.getKey(NamadaExtensionRouterId));

    const Schema = t.union([NamadaExtensionRouterId, t.undefined]);
    const decodedData = Schema.decode(data);

    if (E.isLeft(decodedData)) {
      throw new Error("RouterId is not valid");
    }

    return decodedData.right;
  }

  async setRouterId(id: NamadaExtensionRouterIdType): Promise<void> {
    await this.setRaw(this.getKey(NamadaExtensionRouterId), id);
  }

  async addDisposableSigner(
    address: string,
    privateKey: string,
    publicKey: string,
    realAddress: string
  ): Promise<void> {
    const data = (await this.getDisposableSigners()) || {};
    await this.setDisposableSigners({
      ...data,
      [address]: { privateKey, publicKey, realAddress, timestamp: Date.now() },
    });
  }

  async getDisposableSigner(
    address: string
  ): Promise<
    { privateKey: string; publicKey: string; realAddress: string } | undefined
  > {
    const data = await this.getDisposableSigners();
    return data?.[address];
  }

  async clearOldDisposableSigners(): Promise<void> {
    const data = O.fromNullable(await this.getDisposableSigners());
    const currentTime = Date.now();

    const newData = pipe(
      data,
      O.map((data) => {
        const newData = Object.entries(data).reduce((acc, [key, value]) => {
          // We clear the disposable signers after 60 minutes
          if (currentTime - value.timestamp < 3600000) {
            acc[key] = value;
          }

          return acc;
        }, {} as DisposableSignersType);

        return newData;
      })
    );

    if (O.isSome(newData)) {
      await this.setDisposableSigners(newData.value);
    }
  }

  private async getDisposableSigners(): Promise<
    DisposableSignersType | undefined
  > {
    const data = await this.getRaw(this.getKey(DisposableSigners));

    const Schema = t.union([DisposableSigners, t.undefined]);
    const decodedData = Schema.decode(data);

    if (E.isLeft(decodedData)) {
      throw new Error("Disposable Signers are not valid");
    }

    return decodedData.right;
  }

  private async setDisposableSigners(
    signers: DisposableSignersType
  ): Promise<void> {
    await this.setRaw(this.getKey(DisposableSigners), signers);
  }

  private async setApprovedOrigins(
    origins: NamadaExtensionApprovedOriginsType
  ): Promise<void> {
    await this.setRaw(this.getKey(NamadaExtensionApprovedOrigins), origins);
  }

  private getKey<S extends LocalStorageSchemas>(schema: S): LocalStorageKeys {
    const key = schemasMap.get(schema);
    if (!key) {
      throw new Error(`Could not find key for schema: ${schema}`);
    }

    return key;
  }
}
