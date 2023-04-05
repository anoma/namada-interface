import { Message, Router, Events, Routes } from "../router";

export class TransferCompletedEvent extends Message<void> {
  public static type(): Events {
    return Events.TransferCompleted;
  }

  constructor(readonly success: boolean, readonly msgId: string) {
    super();
  }

  validate(): void {
    if (!this.success) {
      throw new Error("Type should not be empty");
    }
  }

  route(): string {
    return Routes.InteractionForeground;
  }

  type(): string {
    return TransferCompletedEvent.type();
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

export function initEvents(router: Router): void {
  router.registerMessage(TransferCompletedEvent);
  router.registerMessage(TransferStartedEvent);

  router.addHandler(Routes.InteractionForeground, (_, msg) => {
    switch (msg.constructor) {
      case TransferCompletedEvent:
        if ((msg as TransferCompletedEvent).success) {
          window.dispatchEvent(
            new CustomEvent("anoma_transfer_completed", { detail: msg })
          );
        } else {
          window.dispatchEvent(
            new CustomEvent("anoma_transfer_failed", { detail: msg })
          );
        }
        break;
      case TransferStartedEvent:
        window.dispatchEvent(
          new CustomEvent("anoma_transfer_started", { detail: msg })
        );
        break;
      default:
        throw new Error("Unknown msg type");
    }
  });
}
