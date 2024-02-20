import { v5 as uuid } from "uuid";
import browser from "webextension-polyfill";

import { Message, SignatureMsgValue, TxMsgValue, TxProps } from "@namada/types";
import { Result } from "@namada/utils";
import { ISignature } from "@zondax/ledger-namada";

/**
 * Query the current extension tab and close it
 */
export const closeCurrentTab = async (): Promise<void> => {
  const tab = await browser.tabs.getCurrent();
  if (tab.id) {
    browser.tabs.remove(tab.id);
  }
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

/**
 * Convert ISignature into serialized and encoded signature
 */
export const encodeSignature = (sig: ISignature): Uint8Array => {
  const {
    pubkey,
    raw_indices,
    raw_signature,
    wrapper_indices,
    wrapper_signature,
  } = sig;

  /* eslint-disable */
  const props = {
    pubkey: new Uint8Array((pubkey as any).data),
    rawIndices: new Uint8Array((raw_indices as any).data),
    rawSignature: new Uint8Array((raw_signature as any).data),
    wrapperIndices: new Uint8Array((wrapper_indices as any).data),
    wrapperSignature: new Uint8Array((wrapper_signature as any).data),
  };
  /* eslint-enable */

  const value = new SignatureMsgValue(props);
  const msg = new Message<SignatureMsgValue>();
  return msg.encode(value);
};

/**
 * Helper to encode Tx given TxProps
 */
export const encodeTx = (tx: TxProps): Uint8Array => {
  const txMsgValue = new TxMsgValue(tx);
  const msg = new Message<TxMsgValue>();
  return msg.encode(txMsgValue);
};

export const validateProps = <T>(object: T, props: (keyof T)[]): void => {
  props.forEach((prop) => {
    if (!object[prop]) {
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
  privateKey.length > PRIVATE_KEY_MAX_LENGTH
    ? Result.err({ t: "TooLong", maxLength: PRIVATE_KEY_MAX_LENGTH })
    : !/^[0-9a-f]*$/.test(privateKey)
      ? Result.err({ t: "BadCharacter" })
      : Result.ok(null);

// Remove prefix from private key, which may be present when exporting keys from CLI
export const filterPrivateKeyPrefix = (privateKey: string): string =>
  privateKey.length === PRIVATE_KEY_MAX_LENGTH + 2
    ? privateKey.replace(/^00/, "")
    : privateKey;
