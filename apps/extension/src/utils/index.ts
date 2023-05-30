import browser from "webextension-polyfill";
import { v5 as uuid } from "uuid";

import { DerivedAccount } from "@namada/types";
import { pick } from "@namada/utils";
import { AccountStore } from "background/keyring";

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
