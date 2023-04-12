import { createContext, Dispatch } from "react";

import { useEventListenerOnce } from "hooks";
import { actions as notificationsActions } from "slices/notifications";
import { getToast, Toasts } from "slices/transfers";
import { useAppDispatch } from "store";

const TransferCompletedHandler =
  (dispatch: Dispatch<unknown>) => (event: CustomEventInit) => {
    dispatch(
      notificationsActions.createToast(
        getToast(`${event.detail.msgId}-shielded`, Toasts.TransferCompleted)()
      )
    );
  };

const TransferStartedHandler =
  (dispatch: Dispatch<unknown>) => (event: CustomEventInit) => {
    dispatch(
      notificationsActions.createToast(
        getToast(
          `${event.detail.msgId}-shielded`,
          Toasts.ShieldedTransferStarted
        )()
      )
    );
  };

export const ExtensionEventsContext = createContext({});

export const ExtensionEventsProvider: React.FC = (props): JSX.Element => {
  const dispatch = useAppDispatch();
  const transferStartedHandler = TransferStartedHandler(dispatch);
  const transferCompletedHandler = TransferCompletedHandler(dispatch);

  // Register event handlers
  // TODO: Names and payloads should be defined in the content script
  useEventListenerOnce("anoma_transfer_started", transferStartedHandler);
  useEventListenerOnce("anoma_transfer_completed", transferCompletedHandler);

  return (
    <ExtensionEventsContext.Provider value={{}}>
      {props.children}
    </ExtensionEventsContext.Provider>
  );
};
