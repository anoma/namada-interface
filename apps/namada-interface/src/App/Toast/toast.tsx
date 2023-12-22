import { AnimatePresence } from "framer-motion";
import { useCallback, useEffect } from "react";

import { Icon } from "@namada/components";

import type {
  Toast as NotificationToast,
  NotificationsState,
  ToastId,
} from "slices/notifications";
import { ToastTimeoutType, actions } from "slices/notifications";
import { useAppDispatch, useAppSelector } from "store";
import {
  CloseToastButton,
  Container,
  Content,
  Message,
  Title,
  Wrapper,
} from "./toast.components";

export const Toasts = (): JSX.Element => {
  const dispatch = useAppDispatch();

  const { toasts } = useAppSelector<NotificationsState>(
    (state) => state.notifications
  );

  const onClose = useCallback((id: ToastId): void => {
    dispatch(actions.removeToast({ id }));
  }, []);

  return (
    <Container>
      <AnimatePresence>
        {Object.entries(toasts).map(([id, toast], index) => (
          <Toast
            key={id}
            index={index}
            id={id}
            toast={toast}
            onClose={onClose}
          />
        ))}
      </AnimatePresence>
    </Container>
  );
};

type ToastProps = {
  id: ToastId;
  index: number;
  toast: NotificationToast;
  onClose: (id: ToastId) => void;
};

export const Toast = ({
  id,
  index,
  toast,
  onClose,
}: ToastProps): JSX.Element => {
  const timeout = toast.timeout;

  useEffect(() => {
    timeout.kind !== ToastTimeoutType.None &&
      setTimeout(() => {
        onClose(id);
      }, timeout.value);
  }, [timeout.kind]);

  return (
    <Wrapper
      className={toast.type}
      index={index}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Content>
        <Title title={toast.title}>{toast.title}</Title>
        <Message title={toast.message}>{toast.message}</Message>
      </Content>
      <CloseToastButton onClick={() => onClose(id)}>
        <Icon name="ChevronRight" />
      </CloseToastButton>
    </Wrapper>
  );
};
