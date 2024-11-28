import { AccountType, DerivedAccount } from "@namada/types";
import {
  AccountStore,
  DEFAULT_BIP44_PATH,
  DeriveAccountMsg,
  SaveAccountSecretMsg,
} from "background/keyring";
import { CreatePasswordMsg } from "background/vault";
import { ExtensionRequester } from "extension";
import { Ports } from "router";
import { DeriveAccountDetails } from "./types";

/**
 * Set password for the extension
 * @async
 * @param requester - Extension Requester
 * @param password - user password
 * @returns void
 */
export const savePassword = async (
  requester: ExtensionRequester,
  password: string
): Promise<void> => {
  await requester.sendMessage<CreatePasswordMsg>(
    Ports.Background,
    new CreatePasswordMsg(password || "")
  );
};

/**
 * Store account secret, which can be a mnemonic or private key
 * @async
 * @param requester - Extension Requester
 * @param details - account parameters
 * @returns AccountStore type
 */
export const saveAccountSecret = async (
  requester: ExtensionRequester,
  details: DeriveAccountDetails
): Promise<AccountStore> => {
  const { accountSecret, alias, path } = details;
  const derivationPath =
    accountSecret?.t === "PrivateKey" ? DEFAULT_BIP44_PATH : path;

  const parentAccountStore = await requester.sendMessage<SaveAccountSecretMsg>(
    Ports.Background,
    new SaveAccountSecretMsg(accountSecret, alias, derivationPath)
  );

  return parentAccountStore as AccountStore;
};

/**
 * Save shielded keys based on parent account
 * @async
 * @param requester - Extension requester
 * @param details - parent account parameters
 * @param parentAccount - stored parent account
 */
export const saveShieldedAccount = async (
  requester: ExtensionRequester,
  details: DeriveAccountDetails,
  parentAccount: AccountStore
): Promise<DerivedAccount | undefined> => {
  const { path, accountSecret } = details;
  const derivationPath =
    accountSecret?.t === "PrivateKey" ? DEFAULT_BIP44_PATH : path;

  const { alias, id } = parentAccount;
  return await requester.sendMessage<DeriveAccountMsg>(
    Ports.Background,
    new DeriveAccountMsg(
      derivationPath,
      AccountType.ShieldedKeys,
      alias,
      // Sets the parent ID of this shielded account
      id
    )
  );
};
