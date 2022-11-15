import { KVStore, IStore, Store } from "@anoma/storage";
import { PermissionsStore } from "./types";
import { ChainsService } from "../chains";
import { KeyRingService } from "../keyring";

const PERMISSIONS_STORE_KEY = "permissions-store";

export class PermissionsService {
  protected permissionsStore: IStore<PermissionsStore>;
  protected privilegedOrigins: Map<string, boolean> = new Map();
  protected chainsService!: ChainsService;
  protected keyRingService!: KeyRingService;

  constructor(
    protected readonly kvStore: KVStore<PermissionsStore>,
    privilegedOrigins: string[]
  ) {
    this.permissionsStore = new Store(PERMISSIONS_STORE_KEY, kvStore);
    for (const origin of privilegedOrigins) {
      this.privilegedOrigins.set(origin, true);
    }
  }

  public init(
    chainsService: ChainsService,
    keyRingService: KeyRingService
  ): void {
    this.chainsService = chainsService;
    this.keyRingService = keyRingService;
  }
}
