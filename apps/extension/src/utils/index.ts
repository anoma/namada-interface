import browser from "webextension-polyfill";
import { v5 as uuid } from "uuid";

import {
  DerivedAccount,
  Message,
  SignatureMsgValue,
  TxProps,
} from "@namada/types";
import { pick } from "@namada/utils";
import { AccountStore } from "background/keyring";
import { ISignature } from "@namada/ledger-namada";
import { TxMsgValue } from "@namada/types/src/tx/schema/tx";

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
 * Return all unencrypted values from key store
 */
export const getAccountValuesFromStore = (
  accounts: AccountStore[]
): DerivedAccount[] => {
  return accounts.map((account) =>
    pick<DerivedAccount, keyof DerivedAccount>(
      account,
      "address",
      "alias",
      "chainId",
      "id",
      "owner",
      "parentId",
      "publicKey",
      "path",
      "type"
    )
  );
};

/**
 * Construct unique uuid (v5), passing in an arbitray number of arguments.
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
  const { salt, indicies, pubkey, signature } = sig;

  // TODO: Note that the following "any" type usage below is a result of the buffer responses
  // from the Ledger do not match the ISignature type! This will be fixed in a future release.

  /* eslint-disable */
  const props = {
    salt: new Uint8Array((salt as any).data),
    indicies: new Uint8Array((indicies as any).data),
    pubkey: new Uint8Array((pubkey as any).data),
    signature: new Uint8Array((signature as any).data),
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
