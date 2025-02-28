import { AccountType, DerivedAccount } from "@namada/types";
import {
  AccountStore,
  AddLedgerAccountMsg,
  DEFAULT_BIP44_PATH,
  DeriveShieldedAccountMsg,
  SaveAccountSecretMsg,
} from "background/keyring";
import { CreatePasswordMsg } from "background/vault";
import { ExtensionRequester } from "extension";
import { Ports } from "router";
import { DeriveAccountDetails, LedgerAccountDetails } from "./types";

// Wrap account management calls with extension requester instance
export class AccountManager {
  constructor(private readonly requester: ExtensionRequester) {}

  /**
   * Set password for the extension
   * @async
   * @param password - user password
   * @returns void
   */
  async savePassword(password: string): Promise<void> {
    await this.requester.sendMessage<CreatePasswordMsg>(
      Ports.Background,
      new CreatePasswordMsg(password)
    );
  }

  /**
   *
   * Store account secret, which can be a mnemonic or private key
   * @async
   * @param details - account parameters
   * @returns AccountStore type
   */
  async saveAccountSecret(
    details: DeriveAccountDetails
  ): Promise<AccountStore> {
    const { accountSecret, alias, bip44Path, flow } = details;
    // On Private key imports, we don't know the derivation path, so just use default
    const derivationPath =
      accountSecret?.t === "PrivateKey" ? DEFAULT_BIP44_PATH : bip44Path;

    const parentAccountStore =
      await this.requester.sendMessage<SaveAccountSecretMsg>(
        Ports.Background,
        new SaveAccountSecretMsg(accountSecret, alias, flow, derivationPath)
      );

    return parentAccountStore as AccountStore;
  }

  /**
   * Save shielded keys based on parent account
   * @async
   * @param details - parent account parameters
   * @param parentAccount - stored parent account
   */
  async saveShieldedAccount(
    details: DeriveAccountDetails,
    parentAccount: AccountStore
  ): Promise<DerivedAccount | undefined> {
    const { zip32Path } = details;

    const { alias, id, source } = parentAccount;
    return await this.requester.sendMessage<DeriveShieldedAccountMsg>(
      Ports.Background,
      new DeriveShieldedAccountMsg(
        zip32Path,
        AccountType.ShieldedKeys,
        alias,
        // Sets the parent ID of this shielded account
        id,
        source
      )
    );
  }

  /**
   * Save imported Ledger account
   * @async
   * @param details - Ledger account params
   * @returns AccountStore type
   */
  async saveLedgerAccount(
    details: LedgerAccountDetails
  ): Promise<AccountStore> {
    const {
      alias,
      address,
      publicKey,
      bip44Path,
      zip32Path,
      extendedViewingKey,
      pseudoExtendedKey,
      paymentAddress,
    } = details;
    return (await this.requester.sendMessage(
      Ports.Background,
      new AddLedgerAccountMsg(
        alias,
        address,
        publicKey,
        bip44Path,
        zip32Path,
        extendedViewingKey,
        pseudoExtendedKey,
        paymentAddress
      )
    )) as AccountStore;
  }
}
