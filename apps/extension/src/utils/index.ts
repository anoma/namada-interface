import browser from "webextension-polyfill";
import { v5 as uuid } from "uuid";

import {
  DerivedAccount,
  Message,
  SignatureMsgValue,
  SubmitBondMsgValue,
  SubmitUnbondMsgValue,
  SubmitWithdrawMsgValue,
  TransferMsgValue,
  TxProps,
  TxMsgValue,
  IbcTransferMsgValue,
} from "@namada/types";
import { pick } from "@namada/utils";
import { AccountStore } from "background/keyring";
import { ISignature } from "@namada/ledger-namada";
import { TxType } from "@namada/shared";
import { deserialize } from "@dao-xyz/borsh";
import { fromBase64 } from "@cosmjs/encoding";

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
  const { secIndices, singlesig, sigType, multisigIndices, multisig } = sig;

  const props = {
    secIndices: new Uint8Array(secIndices),
    singlesig: singlesig ? new Uint8Array(singlesig) : null,
    sigType,
    multisigIndices: new Uint8Array(multisigIndices),
    multisig: multisig.map((sig) => new Uint8Array(sig))
  };

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

/**
 * Helper to get encoded Tx information by TxType
 */
export const getEncodedTxByType = (
  txType: TxType,
  txMsg: string
): Uint8Array => {
  switch (txType) {
    case TxType.Transfer: {
      const { tx } = deserialize(fromBase64(txMsg), TransferMsgValue);
      return encodeTx(tx);
    }
    case TxType.IBCTransfer: {
      const { tx } = deserialize(fromBase64(txMsg), IbcTransferMsgValue);
      return encodeTx(tx);
    }
    case TxType.Bond: {
      const { tx } = deserialize(fromBase64(txMsg), SubmitBondMsgValue);
      return encodeTx(tx);
    }
    case TxType.Unbond: {
      const { tx } = deserialize(fromBase64(txMsg), SubmitUnbondMsgValue);
      return encodeTx(tx);
    }
    case TxType.Withdraw: {
      const { tx } = deserialize(fromBase64(txMsg), SubmitWithdrawMsgValue);
      return encodeTx(tx);
    }
    default:
      throw new Error("Valid txType not provided!");
  }
};
