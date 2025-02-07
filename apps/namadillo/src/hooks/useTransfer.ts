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
import { useTransaction, UseTransactionOutput } from "hooks/useTransaction";
import { useAtomValue } from "jotai";
import { Address, NamadaTransferTxKind } from "types";
import { useOptimisticTransferUpdate } from "./useOptimisticTransferUpdate";

type useTransferParams = {
  source: Address;
  target: Address;
  token: Address;
  displayAmount: BigNumber;
  onUpdateStatus?: (status: string) => void;
};

type useTransferOutput = (
  | UseTransactionOutput<TransparentTransferMsgValue>
  | UseTransactionOutput<ShieldedTransferMsgValue>
  | UseTransactionOutput<ShieldingTransferMsgValue>
  | UseTransactionOutput<UnshieldingTransferMsgValue>
) & {
  txKind: NamadaTransferTxKind;
};

export const useTransfer = ({
  source,
  target,
  token,
  displayAmount: amount,
  onUpdateStatus,
}: useTransferParams): useTransferOutput => {
  const defaultAccounts = useAtomValue(allDefaultAccountsAtom);
  const shieldedAccount = defaultAccounts.data?.find(
    (account) => account.type === AccountType.ShieldedKeys
  );
  const pseudoExtendedKey = shieldedAccount?.pseudoExtendedKey ?? "";

  const optimisticTransferUpdate = useOptimisticTransferUpdate();

  const commomProps = {
    parsePendingTxNotification: () => ({
      title: "Transfer transaction in progress",
      description: "Your transfer transaction is being processed",
    }),
    parseErrorTxNotification: () => ({
      title: "Transfer transaction failed",
      description: "",
    }),
    onSuccess: () => {
      if (target === shieldedAccount?.address) {
        optimisticTransferUpdate(token, amount);
      }
      if (source === shieldedAccount?.address) {
        optimisticTransferUpdate(token, amount.multipliedBy(-1));
      }
    },
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
    useDisposableSigner: true,
    ...commomProps,
  });

  const shieldingTransaction = useTransaction({
    eventType: "ShieldingTransfer",
    createTxAtom: createShieldingTransferAtom,
    params: [{ target, data: [{ source, token, amount }] }],
    onBeforeCreateDisposableSigner: () =>
      onUpdateStatus?.("Creating new disposable signer..."),
    onBeforeBuildTx: () =>
      onUpdateStatus?.("Generating MASP params and building transaction..."),
    onBeforeSign: () => onUpdateStatus?.("Waiting for signature..."),
    onBeforeBroadcast: () => onUpdateStatus?.("Broadcasting transaction..."),
    ...commomProps,
  });

  const unshieldingTransaction = useTransaction({
    eventType: "UnshieldingTransfer",
    createTxAtom: createUnshieldingTransferAtom,
    params: [{ source: pseudoExtendedKey, data: [{ target, token, amount }] }],
    useDisposableSigner: true,
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
