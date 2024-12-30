import {
  AccountType,
  ShieldedTransferMsgValue,
  ShieldingTransferMsgValue,
  TransparentTransferMsgValue,
  UnshieldingTransferMsgValue,
} from "@namada/types";
import { isShieldedAddress } from "App/Transfer/common";
import { allDefaultAccountsAtom } from "atoms/accounts";
import {
  createShieldedTransferAtom,
  createShieldingTransferAtom,
  createTransparentTransferAtom,
  createUnshieldingTransferAtom,
} from "atoms/transfer/atoms";
import BigNumber from "bignumber.js";
import { useTransaction, useTransactionOutput } from "hooks/useTransaction";
import { useAtomValue } from "jotai";
import { Address, NamadaTransferTxKind } from "types";

type useTransferParams = {
  source: Address;
  target: Address;
  token: Address;
  displayAmount: BigNumber;
};

type useTransferOutput = (
  | useTransactionOutput<TransparentTransferMsgValue>
  | useTransactionOutput<ShieldedTransferMsgValue>
  | useTransactionOutput<ShieldingTransferMsgValue>
  | useTransactionOutput<UnshieldingTransferMsgValue>
) & {
  txKind: NamadaTransferTxKind;
};

export const useTransfer = ({
  source,
  target,
  token,
  displayAmount: amount,
}: useTransferParams): useTransferOutput => {
  const defaultAccounts = useAtomValue(allDefaultAccountsAtom);
  const shieldedAccount = defaultAccounts.data?.find(
    (account) => account.type === AccountType.ShieldedKeys
  );
  const pseudoExtendedKey = shieldedAccount?.pseudoExtendedKey ?? "";

  const commomProps = {
    parsePendingTxNotification: () => ({
      title: "Transfer transaction in progress",
      description: "Your transfer transaction is being processed",
    }),
    parseErrorTxNotification: () => ({
      title: "Transfer transaction failed",
      description: "",
    }),
  };

  const transparentTransaction = useTransaction({
    eventType: "TransparentTransfer",
    createTxAtom: createTransparentTransferAtom,
    params: [{ data: [{ source, target, token, amount }] }],
    ...commomProps,
  });

  const shieldedTransaction = useTransaction({
    eventType: "ShieldedTransfer",
    createTxAtom: createShieldedTransferAtom,
    params: [{ data: [{ source: pseudoExtendedKey, target, token, amount }] }],
    ...commomProps,
  });

  const shieldingTransaction = useTransaction({
    eventType: "ShieldingTransfer",
    createTxAtom: createShieldingTransferAtom,
    params: [{ target, data: [{ source, token, amount }] }],
    ...commomProps,
  });

  const unshieldingTransaction = useTransaction({
    eventType: "UnshieldingTransfer",
    createTxAtom: createUnshieldingTransferAtom,
    params: [{ source: pseudoExtendedKey, data: [{ target, token, amount }] }],
    ...commomProps,
  });

  const getAddressKind = (address: Address): "Shielded" | "Transparent" =>
    isShieldedAddress(address) ? "Shielded" : "Transparent";

  const txKind: NamadaTransferTxKind = `${getAddressKind(source)}To${getAddressKind(target)}`;

  const result = (() => {
    switch (txKind) {
      case "TransparentToTransparent":
        return transparentTransaction;
      case "TransparentToShielded":
        return shieldingTransaction;
      case "ShieldedToTransparent":
        return unshieldingTransaction;
      case "ShieldedToShielded":
        return shieldedTransaction;
    }
  })();

  return {
    ...result,
    txKind,
  };
};
