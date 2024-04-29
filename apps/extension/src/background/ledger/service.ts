import { fromBase64 } from "@cosmjs/encoding";
import { deserialize } from "@dao-xyz/borsh";
import { ResponseSign } from "@zondax/ledger-namada";

import { TxType, TxTypeLabel, makeBip44Path } from "@heliax/namada-sdk/web";
import { chains } from "@namada/chains";
import { KVStore } from "@namada/storage";
import { AccountType, TxMsgValue } from "@namada/types";
import { PendingTx, TxStore } from "background/approvals";
import { KeyRingService } from "background/keyring";
import { SdkService } from "background/sdk";
import { ExtensionBroadcaster, ExtensionRequester } from "extension";
import { RevealedPKStorage, VaultStorage } from "storage";

export const LEDGERSTORE_KEY = "ledger-store";

export class LedgerService {
  constructor(
    protected readonly keyringService: KeyRingService,
    protected readonly sdkService: SdkService,
    protected readonly vaultStorage: VaultStorage,
    protected readonly txStore: KVStore<TxStore>,
    protected readonly revealedPKStorage: RevealedPKStorage,
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

      const sdk = this.sdkService.getSdk();
      const builtTx = await sdk.tx.buildTxFromSerializedArgs(
        TxType.RevealPK,
        new Uint8Array(), // TODO: this is a dummy value. Is there a cleaner way?
        fromBase64(txMsg),
        publicKey
      );
      const path = makeBip44Path(coinType, account.path);

      return { bytes: builtTx.toBytes(), path };
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
    try {
      const sdk = this.sdkService.getSdk();
      const signedTxBytes = sdk.tx.appendSignature(
        fromBase64(bytes),
        signatures
      );
      const signedTx = {
        txMsg: fromBase64(txMsg),
        tx: signedTxBytes,
      };
      await sdk.rpc.broadcastTx(signedTx);
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
    const storedTx = await this.txStore.get(msgId);
    const { tx } = this.sdkService.getSdk();

    if (!storedTx) {
      throw new Error(`Transaction ${msgId} not found!`);
    }

    storedTx.txProps.forEach(async (pendingTx: PendingTx) => {
      const { txMsg } = await tx.buildTx(
        txType,
        storedTx.wrapperTxProps,
        pendingTx
      );
      const sdk = this.sdkService.getSdk();
      await this.broadcaster.startTx(msgId, txType);

      try {
        const signedTxBytes = sdk.tx.appendSignature(
          fromBase64(bytes),
          signatures
        );
        const signedTx = {
          txMsg,
          tx: signedTxBytes,
        };
        const innerTxHash = await sdk.rpc.broadcastTx(signedTx);

        // Clear pending tx if successful
        await this.txStore.set(msgId, null);

        // Broadcast update events
        await this.broadcaster.completeTx(msgId, txType, true, innerTxHash);
        await this.broadcaster.updateBalance();

        if ([TxType.Bond, TxType.Unbond, TxType.Withdraw].includes(txType)) {
          await this.broadcaster.updateStaking();
        }
      } catch (e) {
        console.warn(e);
        await this.broadcaster.completeTx(msgId, txType, false, `${e}`);
      }
    });
  }

  async getTxBytes(
    txType: TxType,
    msgId: string,
    address: string
  ): Promise<{ bytes: Uint8Array; path: string }[]> {
    const storedTx = await this.txStore.get(msgId);

    if (!storedTx) {
      console.warn(`txMsg not found for msgId: ${msgId}`);
      throw new Error(`${TxTypeLabel[txType]} Transaction ${msgId} not found!`);
    }

    const { coinType } = chains.namada.bip44;

    return Promise.all(
      storedTx.txProps.map(async (pendingTx: PendingTx) => {
        const { tx } = this.sdkService.getSdk();
        const { txMsg, tx: specificMsg } = await tx.buildTx(
          txType,
          storedTx.wrapperTxProps,
          pendingTx
        );
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

          const sdk = this.sdkService.getSdk();
          const builtTx = await sdk.tx.buildTxFromSerializedArgs(
            txType,
            specificMsg.tx_bytes(),
            txMsg,
            account.publicKey
          );
          const path = makeBip44Path(coinType, account.path);

          return { bytes: builtTx.toBytes(), path };
        } catch (e) {
          console.warn(e);
          throw new Error(`${e}`);
        }
      })
    );
  }

  async queryStoredRevealedPK(publicKey: string): Promise<boolean> {
    const pks = await this.revealedPKStorage.getRevealedPKs();
    return pks?.includes(publicKey) || false;
  }

  async storeRevealedPK(publicKey: string): Promise<void> {
    await this.revealedPKStorage.addRevealedPK(publicKey);
  }
}
