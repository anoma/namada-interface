import { fromBase64, toBase64 } from "@cosmjs/encoding";
import {
  Account,
  AccountType,
  Bip44Path,
  DerivedAccount,
  Path,
  TransferProps,
  TxProps,
} from "@namada/types";
import { v5 as uuid } from "uuid";
import browser from "webextension-polyfill";

import { Result } from "@namada/utils";
import { TransferType } from "Approvals/types";
import { EncodedTxData } from "background/approvals";

/**
 * Query the current extension tab and close it
 */
export const closeCurrentTab = async (): Promise<void> => {
  const tab = await browser.tabs.getCurrent();
  if (tab.id) {
    await browser.tabs.remove(tab.id);
  }
};

/**
 * Launch the Setup tab, close existing popup
 */
export const openSetupTab = async (): Promise<void> => {
  await browser.tabs
    .create({
      url: browser.runtime.getURL("setup.html"),
    })
    .then(() => close());
};

export const fillArray = (arr: string[], length: number): string[] => {
  return arr.concat(Array(length - arr.length).fill("")).slice(0, length);
};

/**
 * Construct unique uuid (v5), passing in an arbitrary number of arguments.
 * This could be a unique parameter of the object receiving the id,
 * or an index based on the number of existing objects in a hierarchy.
 */
export const generateId = (
  namespace: string,
  ...args: (number | string)[]
): string => {
  return uuid(args.join(":"), namespace);
};

export const validateProps = <T>(object: T, props: (keyof T)[]): void => {
  props.forEach((prop) => {
    if (typeof object[prop] === "undefined") {
      throw new Error(`${String(prop)} was not provided!`);
    }
  });
};

const PRIVATE_KEY_MAX_LENGTH = 64;

export type PrivateKeyError =
  | { t: "TooLong"; maxLength: number }
  | { t: "BadCharacter" };

// Very basic private key validation
export const validatePrivateKey = (
  privateKey: string
): Result<null, PrivateKeyError> =>
  privateKey.length > PRIVATE_KEY_MAX_LENGTH ?
    Result.err({ t: "TooLong", maxLength: PRIVATE_KEY_MAX_LENGTH })
  : !/^[0-9a-f]*$/.test(privateKey) ? Result.err({ t: "BadCharacter" })
  : Result.ok(null);

// Remove prefix from private key, which may be present when exporting keys from CLI
export const filterPrivateKeyPrefix = (privateKey: string): string =>
  privateKey.length === PRIVATE_KEY_MAX_LENGTH + 2 ?
    privateKey.replace(/^00/, "")
  : privateKey;

// Convert any Uint8Arrays in TxProps to string, and construct EncodedTxData
export const toEncodedTx = (txProps: TxProps): EncodedTxData => ({
  ...txProps,
  bytes: toBase64(txProps.bytes),
  signingData: txProps.signingData.map((sd) => ({
    ...sd,
    masp: sd.masp ? toBase64(sd.masp) : undefined,
    shieldedHash: sd.shieldedHash ? toBase64(sd.shieldedHash) : undefined,
    accountPublicKeysMap:
      sd.accountPublicKeysMap ? toBase64(sd.accountPublicKeysMap) : undefined,
  })),
});

// Convert base64 strings back to Uint8Arrays in EncodedTxData to restore TxProps
export const fromEncodedTx = (encodedTxData: EncodedTxData): TxProps => ({
  ...encodedTxData,
  bytes: fromBase64(encodedTxData.bytes),
  signingData: encodedTxData.signingData.map((sd) => ({
    ...sd,
    masp: sd.masp ? fromBase64(sd.masp) : undefined,
    shieldedHash: sd.shieldedHash ? fromBase64(sd.shieldedHash) : undefined,
    accountPublicKeysMap:
      sd.accountPublicKeysMap ? fromBase64(sd.accountPublicKeysMap) : undefined,
  })),
});

// Generate either BIP44 or ZIP32 path from BIP44 based on account type
export const makeStoredPath = (
  accountType: AccountType,
  path: Bip44Path
): Path => {
  const { account, change, index } = path;
  return accountType === AccountType.ShieldedKeys ?
      // If this is a custom address (non-default account or index in the BIP44 path),
      // specify index for shielded keys. In Namada CLI, the default ZIP32 path only
      // specifies "account"
      { account, index: account + index > 0 ? index : undefined }
    : { account, change, index };
};

export const isCustomPath = (path: Path): boolean => {
  const { account, change = 0, index = 0 } = path;
  if (account + change + index > 0) {
    return true;
  }
  return false;
};

export const ShieldedPoolLabel = "the shielded pool";
export const hasShieldedSection = (tx: TransferProps): boolean => {
  return Boolean(tx.shieldedSectionHash);
};
export const isShieldedPool = (address: string): boolean => {
  const shieldedPoolRegex = /qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq/;
  return Boolean(address.match(shieldedPoolRegex));
};

/**
 * Create label to indicate specific type of Transfer
 * @param tx TransferProps
 * @returns string label
 */
export const parseTransferType = (
  tx: TransferProps,
  wrapperFeePayer?: string
): { source: string; target: string; type: TransferType } => {
  const { sources, targets } = tx;
  const source = sources[0].owner;
  const target = targets[0].owner;
  const fromMasp = isShieldedPool(source);

  const unshieldingToPayFees = Boolean(
    fromMasp && targets.find((t) => t.owner === wrapperFeePayer)
  );
  const isUnshielding =
    fromMasp && unshieldingToPayFees ?
      // If we're unshielding to pay fees, we should have one more target
      targets.length === sources.length + 1
      // Otherwise, we should have the same number of targets as sources
    : targets.length === sources.length;

  const isShieldedTransfer =
    fromMasp && unshieldingToPayFees ?
      // If we're unshielding to pay fees, we should have exactly one source and one target
      targets.length === 1 && sources.length === 1
      // Otherwise, we should have no targets and no sources, as everything is in the shielded pool
    : targets.length === 0 && sources.length === 0;

  let type: TransferType = "Transparent";
  const txHasShieldedSection = hasShieldedSection(tx);

  if (txHasShieldedSection) {
    if (isShieldedPool(source)) {
      if (isShieldedTransfer) {
        type = "Shielded";
      } else if (isUnshielding) {
        type = "Unshielding";
      } else {
        type = "Unknown";
      }
    } else if (isShieldedPool(target)) {
      type = "Shielding";
    }
  }

  return {
    source,
    target,
    type,
  };
};

/**
 * Accepts a derived account, returns only values needed for Account
 * @param derivedAccount - Derived account type returned from keyring
 * @returns Account type for public API
 */
export const toPublicAccount = (derivedAccount: DerivedAccount): Account => {
  const {
    alias,
    address,
    type,
    publicKey,
    owner,
    pseudoExtendedKey,
    source,
    timestamp,
  } = derivedAccount;
  const isShielded = type === AccountType.ShieldedKeys;
  const account: Account = {
    alias,
    address,
    type,
  };
  if (isShielded) {
    account.viewingKey = owner;
    account.pseudoExtendedKey = pseudoExtendedKey;
    account.source = source;
    account.timestamp = timestamp;
  } else {
    account.publicKey = publicKey;
  }
  return account;
};
