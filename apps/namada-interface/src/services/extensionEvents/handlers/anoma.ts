import { Dispatch } from "react";

import { chains } from "@anoma/chains";
import { Anoma } from "@anoma/integrations";

import { addAccounts, fetchBalances } from "slices/accounts";
import { actions as notificationsActions } from "slices/notifications";
import { getToast, Toasts } from "slices/transfers";
import { fetchValidators } from "slices/StakingAndGovernance/actions";

export const AnomaAccountChangedHandler =
  (dispatch: Dispatch<unknown>, integration: Anoma) =>
    async (event: CustomEventInit) => {
      const chainId = event.detail?.chainId;
      const chain = chains[chainId];

      if (chain.extension.id === "anoma") {
        const accounts = (await integration.accounts()) || [];

        dispatch(addAccounts(accounts));
        dispatch(fetchBalances());
      }
    };

export const AnomaUpdatedBalancesHandler =
  (dispatch: Dispatch<unknown>) => async () => {
    dispatch(fetchBalances());
  };

export const AnomaUpdatedStakingHandler =
  (dispatch: Dispatch<unknown>) => async () => {
    dispatch(fetchValidators());
  };

export const AnomaTransferStartedHandler =
  (dispatch: Dispatch<unknown>) => async (event: CustomEventInit) => {
    const { msgId } = event.detail;
    dispatch(
      notificationsActions.createToast(
        getToast(
          `${event.detail.msgId}-transfer`,
          Toasts.TransferStarted
        )({ msgId })
      )
    );
  };

export const AnomaTransferCompletedHandler =
  (dispatch: Dispatch<unknown>) => async (event: CustomEventInit) => {
    const { msgId, success } = event.detail;
    dispatch(
      notificationsActions.createToast(
        getToast(
          `${event.detail.msgId}-transfer`,
          Toasts.TransferCompleted
        )({ msgId, success })
      )
    );
  };
