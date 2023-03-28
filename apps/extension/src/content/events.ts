import { Message, Router, Events, Routes } from "../router";

export class TransferCompletedMsg extends Message<void> {
  public static type(): Events {
    return Events.TransferCompleted;
  }

  constructor(readonly success: boolean) {
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
    return TransferCompletedMsg.type();
  }
}

export function initEvents(router: Router): void {
  router.registerMessage(TransferCompletedMsg);

  router.addHandler(Routes.InteractionForeground, (_, msg) => {
    switch (msg.constructor) {
      case TransferCompletedMsg:
        if ((msg as TransferCompletedMsg).success) {
          window.dispatchEvent(new Event("anoma_transfer_completed"));
        } else {
          window.dispatchEvent(new Event("anoma_transfer_failed"));
        }
        return;
      default:
        throw new Error("Unknown msg type");
    }
  });
}
