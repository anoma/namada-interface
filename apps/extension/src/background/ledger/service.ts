import { fromBase64 } from "@cosmjs/encoding";
import { deserialize } from "@dao-xyz/borsh";
import { ResponseSign } from "@zondax/ledger-namada";

import { chains } from "@namada/chains";
import { TxType } from "@namada/shared";
import { KVStore } from "@namada/storage";
import { AccountType, TxMsgValue } from "@namada/types";
import { makeBip44Path } from "@namada/utils";
import { TxStore } from "background/approvals";
import { AccountStore, KeyRingService, TabStore } from "background/keyring";
import { SdkService } from "background/sdk";
import { ExtensionBroadcaster, ExtensionRequester } from "extension";
import { encodeSignature } from "utils";

export const LEDGERSTORE_KEY = "ledger-store";
const REVEALED_PK_STORE = "revealed-pk-store";

export class LedgerService {
  constructor(
    protected readonly keyringService: KeyRingService,
    protected readonly sdkService: SdkService,
    protected readonly kvStore: KVStore<AccountStore[]>,
    protected readonly connectedTabsStore: KVStore<TabStore[]>,
    protected readonly txStore: KVStore<TxStore>,
    protected readonly revealedPKStore: KVStore<string[]>,
    protected readonly requester: ExtensionRequester,
    protected readonly broadcaster: ExtensionBroadcaster
  ) {}

  async getRevealPKBytes(
    txMsg: string
  ): Promise<{ bytes: Uint8Array; path: string }> {
    const { coinType } = chains.namada.bip44;

    try {
      // Deserialize txMsg to retrieve source
      const { publicKey } = deserialize(
        Buffer.from(fromBase64(txMsg)),
        TxMsgValue
      );

      if (!publicKey) {
        throw new Error("Public key not found in txMsg");
      }

      // Query account from Ledger storage to determine path for signer
      const account =
        await this.keyringService.findParentByPublicKey(publicKey);

      if (!account) {
        throw new Error(`Ledger account not found for ${publicKey}`);
      }

      if (account.type !== AccountType.Ledger) {
        throw new Error(`Returned Account is not a Ledger`);
      }

      const sdk = await this.sdkService.getSdk();
      const bytes = await sdk.build_tx(
        TxType.RevealPK,
        new Uint8Array(), // TODO: this is a dummy value. Is there a cleaner way?
        fromBase64(txMsg),
        publicKey
      );
      const path = makeBip44Path(coinType, account.path);

      return { bytes, path };
    } catch (e) {
      console.warn(e);
      throw new Error(`${e}`);
    }
  }

  async submitRevealPk(
    txMsg: string,
    bytes: string,
    signatures: ResponseSign
  ): Promise<void> {
    const { signature } = signatures;

    if (!signature) {
      throw new Error("Signature not provided");
    }

    try {
      // Serialize signatures
      const sig = encodeSignature(signature);

      const sdk = await this.sdkService.getSdk();
      const signedTxBytes = await sdk.append_signature(fromBase64(bytes), sig);
      await sdk.process_tx(signedTxBytes, fromBase64(txMsg));
    } catch (e) {
      console.warn(e);
    }
  }

  async submitTx(
    txType: TxType,
    msgId: string,
    bytes: string,
    signatures: ResponseSign
  ): Promise<void> {
    const storeResult = await this.txStore.get(msgId);

    if (!storeResult) {
      throw new Error(`Transaction ${msgId} not found!`);
    }

    const { txMsg } = storeResult;

    const { signature } = signatures;

    if (!signature) {
      throw new Error("Signature not provided!");
    }

    // Serialize signatures
    const sig = encodeSignature(signature);

    await this.broadcaster.startTx(msgId, txType);
    const sdk = await this.sdkService.getSdk();
    try {
      const signedTxBytes = await sdk.append_signature(fromBase64(bytes), sig);
      await sdk.process_tx(signedTxBytes, fromBase64(txMsg));

      // Clear pending tx if successful
      await this.txStore.set(msgId, null);

      // Broadcast update events
      this.broadcaster.completeTx(msgId, txType, true);
      this.broadcaster.updateBalance();

      if ([TxType.Bond, TxType.Unbond, TxType.Withdraw].includes(txType)) {
        this.broadcaster.updateStaking();
      }
    } catch (e) {
      console.warn(e);
      this.broadcaster.completeTx(msgId, txType, false, `${e}`);
    }
  }

  async getTxBytes(
    txType: TxType,
    msgId: string,
    address: string
  ): Promise<{ bytes: Uint8Array; path: string }> {
    const storeResult = await this.txStore.get(msgId);

    if (!storeResult) {
      console.warn(`txMsg not found for msgId: ${msgId}`);
      throw new Error(`Transfer Transaction ${msgId} not found!`);
    }

    const { txMsg, specificMsg } = storeResult;

    const { coinType } = chains.namada.bip44;

    try {
      // Query account from Ledger storage to determine path for signer
      const account = await this.keyringService.findByAddress(address);

      if (!account) {
        throw new Error(`Ledger account not found for ${address}`);
      }

      if (!account.publicKey) {
        throw new Error(`Ledger account missing public key for ${address}`);
      }

      if (account.type !== AccountType.Ledger) {
        throw new Error(`Ledger account not found for ${address}`);
      }

      const sdk = await this.sdkService.getSdk();
      const bytes = await sdk.build_tx(
        txType,
        fromBase64(specificMsg),
        fromBase64(txMsg),
        account.publicKey
      );
      const path = makeBip44Path(coinType, account.path);

      return { bytes, path };
    } catch (e) {
      console.warn(e);
      throw new Error(`${e}`);
    }
  }

  async queryStoredRevealedPK(publicKey: string): Promise<boolean> {
    const pks = await this.revealedPKStore.get(REVEALED_PK_STORE);
    return pks?.includes(publicKey) || false;
  }

  async storeRevealedPK(publicKey: string): Promise<void> {
    const pks = (await this.revealedPKStore.get(REVEALED_PK_STORE)) || [];
    if (!pks.includes(publicKey)) {
      pks.push(publicKey);
    }
    await this.revealedPKStore.set(REVEALED_PK_STORE, pks);
  }
}
