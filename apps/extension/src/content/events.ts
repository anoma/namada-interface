import { Events } from "@anoma/types";

import { Message, Router, Routes } from "../router";

export class AccountChangedEventMsg extends Message<void> {
  public static type(): Events {
    return Events.AccountChanged;
  }

  constructor(public readonly chainId: string) {
    super();
  }

  validate(): void {
    if (!this.chainId) {
      throw new Error("chainId must not be empty");
    }
  }

  route(): string {
    return Routes.InteractionForeground;
  }

  type(): string {
    return AccountChangedEventMsg.type();
  }
}

export class TransferStartedEvent extends Message<void> {
  public static type(): Events {
    return Events.TransferStarted;
  }

  constructor(readonly msgId: string) {
    super();
  }

  validate(): void {
    if (!this.msgId) {
      throw new Error("msgId should not be empty");
    }
  }

  route(): string {
    return Routes.InteractionForeground;
  }

  type(): string {
    return TransferStartedEvent.type();
  }
}

export class TransferCompletedEvent extends Message<void> {
  public static type(): Events {
    return Events.TransferCompleted;
  }

  constructor(readonly msgId: string, readonly success: boolean) {
    super();
  }

  validate(): void {
    if (!this.msgId) {
      throw new Error("msgId should not be empty");
    }
  }

  route(): string {
    return Routes.InteractionForeground;
  }

  type(): string {
    return TransferCompletedEvent.type();
  }
}

// Used by Firefox to copy the object from the content script scope to the
// page script scope.
declare function cloneInto<T>(data: T, global: Window | null): T;

export class UpdatedBalancesEventMsg extends Message<void> {
  public static type(): Events {
    return Events.UpdatedBalances;
  }

  constructor(public readonly chainId: string) {
    super();
  }

  validate(): void {
    if (!this.chainId) {
      throw new Error("chainId must not be empty");
    }
  }

  route(): string {
    return Routes.InteractionForeground;
  }

  type(): string {
    return UpdatedBalancesEventMsg.type();
  }
}

export function initEvents(router: Router): void {
  router.registerMessage(AccountChangedEventMsg);
  router.registerMessage(TransferStartedEvent);
  router.registerMessage(TransferCompletedEvent);
  router.registerMessage(UpdatedBalancesEventMsg);

  router.addHandler(Routes.InteractionForeground, (_, msg) => {
    const clonedMsg =
      typeof cloneInto !== "undefined"
        ? cloneInto(msg, document.defaultView)
        : msg;

    switch (msg.constructor) {
      case AccountChangedEventMsg:
        if ((msg as AccountChangedEventMsg).chainId) {
          window.dispatchEvent(
            new CustomEvent(Events.AccountChanged, { detail: clonedMsg })
          );
        }
        break;
      case TransferStartedEvent:
        window.dispatchEvent(
          new CustomEvent(Events.TransferStarted, { detail: clonedMsg })
        );
        break;
      case TransferCompletedEvent:
        window.dispatchEvent(
          new CustomEvent(Events.TransferCompleted, { detail: clonedMsg })
        );
        break;
      case UpdatedBalancesEventMsg:
        window.dispatchEvent(new CustomEvent(Events.UpdatedBalances));
        break;
      default:
        throw new Error("Unknown msg type");
    }
  });
}
