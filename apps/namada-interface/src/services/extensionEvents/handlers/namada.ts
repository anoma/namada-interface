import { Dispatch } from "react";

import { chains } from "@namada/chains";
import { Namada } from "@namada/integrations";
import { TxType, TxTypeLabel } from "@namada/shared";

import { addAccounts, fetchBalances } from "slices/accounts";
import { actions as notificationsActions } from "slices/notifications";
import { getToast, Toasts } from "slices/transfers";
import { fetchValidators } from "slices/StakingAndGovernance/actions";

export const NamadaAccountChangedHandler =
  (dispatch: Dispatch<unknown>, integration: Namada) =>
    async (event: CustomEventInit) => {
      const chainId = event.detail?.chainId;
      const chain = chains[chainId];

      if (chain.extension.id === "namada") {
        const accounts = (await integration.accounts()) || [];

        dispatch(addAccounts(accounts));
        dispatch(fetchBalances());
      }
    };

export const NamadaUpdatedBalancesHandler =
  (dispatch: Dispatch<unknown>) => async () => {
    dispatch(fetchBalances());
  };

export const NamadaUpdatedStakingHandler =
  (dispatch: Dispatch<unknown>) => async () => {
    dispatch(fetchValidators());
  };

export const NamadaTxStartedHandler =
  (dispatch: Dispatch<unknown>) => async (event: CustomEventInit) => {
    const { msgId, txType } = event.detail;
    dispatch(
      notificationsActions.txStartedToast({
        id: msgId,
        txTypeLabel: TxTypeLabel[txType as TxType],
      })
    );
  };

export const NamadaTxCompletedHandler =
  (dispatch: Dispatch<unknown>) => async (event: CustomEventInit) => {
    const { msgId, txType, success } = event.detail;
    dispatch(
      notificationsActions.txCompletedToast({
        id: msgId,
        txTypeLabel: TxTypeLabel[txType as TxType],
        success,
      })
    );
  };

export const NamadaTransferStartedHandler =
  (dispatch: Dispatch<unknown>) => async (event: CustomEventInit) => {
    const { msgId } = event.detail;
    dispatch(
      notificationsActions.createToast(
        getToast(
          `${event.detail.msgId}-transfer`,
          Toasts.TransferStarted
        )({ msgId, txType: TxType.Transfer })
      )
    );
  };

export const NamadaTransferCompletedHandler =
  (dispatch: Dispatch<unknown>) => async (event: CustomEventInit) => {
    const { msgId, success } = event.detail;
    dispatch(
      notificationsActions.createToast(
        getToast(
          `${event.detail.msgId}-transfer`,
          Toasts.TransferCompleted
        )({ msgId, success, txType: TxType.Transfer })
      )
    );
  };
