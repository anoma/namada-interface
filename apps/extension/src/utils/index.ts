import { fromBase64, toBase64 } from "@cosmjs/encoding";
import { TxProps } from "@namada/types";
import { v5 as uuid } from "uuid";
import browser from "webextension-polyfill";

import { Result } from "@namada/utils";
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
    accountPublicKeysMap:
      sd.accountPublicKeysMap ? fromBase64(sd.accountPublicKeysMap) : undefined,
  })),
});
